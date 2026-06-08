"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { SAMPLE_EMPLOYEES } from "@/lib/data/employees";
import { CandidateInternal, EvalGrade } from "@/lib/types";
import { classifyPerformanceType, PerformanceType } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { EmployeeDetail } from "./EmployeeDetail";
import { IconSearch } from "@/components/ui/icons";

// ── 이탈 위험 계산 ─────────────────────────────
const STAGNATION_THRESH: Record<string, number> = {
  사원급: 3, 대리급: 4, 과장급: 5, 차장급: 5, 부장급: 6, 임원: 99,
};

export function attritionRisk(emp: CandidateInternal) {
  if (emp.gradeYears >= (STAGNATION_THRESH[emp.gradeGroup] ?? 5)) return "승진적체";
  if (emp.avgEval === "C") return "평가하락";
  return null;
}

// ── 출생연도 계산 (CSV 기준연도 2026) ──────────
const REF_YEAR = 2026;
function birthDecadeOf(age: number): string {
  if (!age || age <= 0) return "";
  const year = REF_YEAR - age;
  return String(Math.floor(year / 10) * 10).slice(2, 4) + "년대생";
}

// ── 상수 ──────────────────────────────────────
const GRADE_GROUPS  = ["전체", "사원급", "대리급", "과장급", "차장급", "부장급", "임원"];
const WORK_LOCS     = ["전체", "본사", "현장"];
const BIRTH_DECADES = ["전체", "60년대생", "70년대생", "80년대생", "90년대생"];
const PERF_TYPES    = ["전체", "고성과 유형", "프로세스형", "전략형", "피플형"] as const;
const SCHOOL_TIERS  = ["전체", "3개대", "7개대", "12개대", "25개대", "지방국립대", "기타대"];

const EVAL_TONE: Record<EvalGrade, string> = {
  HP: "bg-signal-greenBg text-signal-green",
  SP: "bg-signal-blueBg text-signal-blue",
  IP: "bg-canvas text-ink-500",
  A:  "bg-signal-amberBg text-signal-amber",
  C:  "bg-signal-redBg text-signal-red",
  "-":"bg-canvas text-ink-400",
};

const PERF_TYPE_STYLE: Record<PerformanceType, { chip: string; active: string }> = {
  "고성과 유형": { chip: "bg-signal-greenBg text-signal-green", active: "border-signal-green bg-signal-greenBg text-signal-green" },
  "프로세스형":  { chip: "bg-signal-blueBg text-signal-blue",   active: "border-signal-blue bg-signal-blueBg text-signal-blue" },
  전략형:        { chip: "bg-brand-50 text-brand-700",          active: "border-brand-200 bg-brand-50 text-brand-700" },
  피플형:        { chip: "bg-signal-amberBg text-signal-amber", active: "border-signal-amber bg-signal-amberBg text-signal-amber" },
};

function emoneyColor(v: number) {
  if (v >= 1)  return "bg-signal-greenBg text-signal-green";
  if (v >= 0)  return "bg-canvas text-ink-500";
  return "bg-signal-redBg text-signal-red";
}

const BTN_BASE = "rounded-xl border px-2.5 py-1.5 text-[12px] font-semibold transition";
const BTN_OFF  = "border-line bg-surface text-ink-500 hover:bg-canvas";
const BTN_ON   = "border-brand-200 bg-brand-50 text-brand-700";

export function TalentClient() {
  const [q,           setQ]          = useState("");
  const [group,       setGroup]      = useState("전체");
  const [workLoc,     setWorkLoc]    = useState("전체");
  const [birthDecade, setBirthDecade]= useState("전체");
  const [perfType,    setPerfType]   = useState("전체");
  const [schoolTier,  setSchoolTier] = useState("전체");
  const [selected,    setSelected]   = useState<CandidateInternal | null>(null);

  const view = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return SAMPLE_EMPLOYEES.filter((e) => {
      const okG  = group      === "전체" || e.gradeGroup    === group;
      const okW  = workLoc   === "전체" || e.workLocation  === workLoc;
      const okB  = birthDecade === "전체" || birthDecadeOf(e.age) === birthDecade;
      const okP  = perfType  === "전체" || classifyPerformanceType(e) === perfType;
      const okST = schoolTier === "전체" || e.schoolTier === schoolTier;
      const hay  = [
        e.name, e.orgGroup, e.orgName, e.grade, e.workLocation,
        e.mbti, e.school ?? "", e.major ?? "",
        ...e.job, ...e.strengths,
      ].join(" ").toLowerCase();
      const okQ  = !ql || hay.includes(ql);
      return okG && okW && okB && okP && okST && okQ;
    });
  }, [q, group, workLoc, birthDecade, perfType, schoolTier]);

  const activeCount = SAMPLE_EMPLOYEES.filter(e => e.status === "재직자").length;

  return (
    <>
      <PageHeader
        title="내부 인재 풀"
        subtitle={`유통BG 전체 ${activeCount}명(재직자) 데이터. 행을 클릭하면 역량·DISC·컴스타일·강점 상세를 확인합니다.`}
      />

      <div className="space-y-4 px-8 py-6">
        {/* 툴바 */}
        <div className="space-y-2.5">

          {/* Row 1: 검색 */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-[320px]">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="이름·조직·직무·강점·학교 검색"
                className="input pl-9"
              />
            </div>
          </div>

          {/* Row 2: 직급 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-ink-400">직급</span>
            <div className="flex items-center gap-1">
              {GRADE_GROUPS.map((g) => (
                <button key={g} onClick={() => setGroup(g)}
                  className={cn(BTN_BASE, group === g ? BTN_ON : BTN_OFF)}>{g}</button>
              ))}
            </div>
          </div>

          {/* Row 3: 본사/현장 + 출생연도 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-ink-400">본사/현장</span>
            <div className="flex items-center gap-1">
              {WORK_LOCS.map((w) => (
                <button key={w} onClick={() => setWorkLoc(w)}
                  className={cn(BTN_BASE, workLoc === w ? BTN_ON : BTN_OFF)}>{w}</button>
              ))}
            </div>
            <div className="h-5 w-px bg-line" />
            <span className="text-[11px] font-semibold text-ink-400">출생연도</span>
            <div className="flex items-center gap-1">
              {BIRTH_DECADES.map((d) => (
                <button key={d} onClick={() => setBirthDecade(d)}
                  className={cn(BTN_BASE, birthDecade === d ? BTN_ON : BTN_OFF)}>{d}</button>
              ))}
            </div>
          </div>

          {/* Row 4: 성과 유형 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-ink-400">성과 유형</span>
            <div className="flex items-center gap-1">
              {PERF_TYPES.map((p) => {
                const isAll = p === "전체";
                const active = perfType === p;
                const style = !isAll && active
                  ? PERF_TYPE_STYLE[p as PerformanceType].active
                  : active ? BTN_ON : BTN_OFF;
                return (
                  <button key={p} onClick={() => setPerfType(p)}
                    className={cn(BTN_BASE, style)}>{p}</button>
                );
              })}
            </div>
          </div>

          {/* Row 5: 학교 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-ink-400">학교</span>
            <div className="flex items-center gap-1">
              {SCHOOL_TIERS.map((s) => (
                <button key={s} onClick={() => setSchoolTier(s)}
                  className={cn(BTN_BASE, schoolTier === s ? BTN_ON : BTN_OFF)}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* 결과 수 */}
        <div className="text-[12px] text-ink-400">
          총 {SAMPLE_EMPLOYEES.length}명 중 <span className="font-semibold text-ink-700">{view.length}명</span> 표시
        </div>

        {/* 테이블 */}
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-canvas text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-4 py-3">이름</th>
                  <th className="px-4 py-3">직급</th>
                  <th className="px-4 py-3">조직</th>
                  <th className="px-4 py-3">본사/현장</th>
                  <th className="px-4 py-3">체류</th>
                  <th className="px-4 py-3">E머니</th>
                  <th className="px-4 py-3">DISC</th>
                  <th className="px-4 py-3">평가</th>
                  <th className="px-4 py-3">성과 유형</th>
                  <th className="px-4 py-3">대표 강점</th>
                  <th className="px-4 py-3">상태·표식</th>
                </tr>
              </thead>
              <tbody>
                {view.map((e) => {
                  const risk   = attritionRisk(e);
                  const emoney = e.emoney ?? 0;
                  const ptype  = classifyPerformanceType(e);
                  return (
                    <tr key={e.id} onClick={() => setSelected(e)}
                      className="cursor-pointer border-b border-line/60 text-[12.5px] transition last:border-0 hover:bg-canvas">
                      <td className="px-4 py-2.5">
                        <span className="font-semibold text-ink-900">{e.name}</span>
                        {e.status === "휴직자" && (
                          <span className="ml-1.5 rounded bg-canvas px-1 py-0.5 text-[10px] text-ink-400">휴직</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-ink-700">{e.grade}</td>
                      <td className="px-4 py-2.5 text-ink-500 max-w-[160px]">
                        <div className="truncate">{e.orgName}</div>
                        <div className="text-[11px] text-ink-300">{e.orgGroup}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="chip bg-canvas text-ink-500 text-[11px]">{e.workLocation || "-"}</span>
                      </td>
                      <td className="px-4 py-2.5 text-ink-500">{e.gradeYears}년</td>
                      <td className="px-4 py-2.5">
                        <span className={cn("chip text-[11.5px] font-bold", emoneyColor(emoney))}>
                          {emoney > 0 ? "+" : ""}{emoney}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="chip bg-brand-50 text-brand-700">{e.disc}형</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={cn("chip", EVAL_TONE[e.avgEval])}>{e.avgEval}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        {ptype ? (
                          <span className={cn("chip text-[11px] font-semibold", PERF_TYPE_STYLE[ptype].chip)}>
                            {ptype}
                          </span>
                        ) : (
                          <span className="text-[11px] text-ink-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-ink-500 max-w-[160px]">
                        <div className="truncate">{e.strengths.slice(0, 3).join(" · ")}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {risk === "승진적체" && (
                            <span className="chip bg-signal-amberBg text-signal-amber text-[10.5px]">승진적체</span>
                          )}
                          {risk === "평가하락" && (
                            <span className="chip bg-signal-redBg text-signal-red text-[10.5px]">평가하락</span>
                          )}
                          {e.ebgPass === "O" && (
                            <span className="chip bg-signal-greenBg text-signal-green text-[10.5px]">EBG</span>
                          )}
                          {e.managerClass && (
                            <span className="chip bg-signal-amberBg text-signal-amber text-[10.5px]">경영자반</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!view.length && (
            <div className="py-14 text-center text-[13px] text-ink-400">
              조건에 맞는 인재가 없습니다
            </div>
          )}
        </div>
      </div>

      <EmployeeDetail emp={selected} onClose={() => setSelected(null)} pool={SAMPLE_EMPLOYEES} />
    </>
  );
}
