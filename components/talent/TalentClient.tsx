"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { SAMPLE_EMPLOYEES } from "@/lib/data/employees";
import { CandidateInternal, EvalGrade } from "@/lib/types";
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

// ── 상수 ──────────────────────────────────────
const GRADE_GROUPS = ["전체", "사원급", "대리급", "과장급", "차장급", "부장급", "임원"];
const WORK_LOCS    = ["전체", "본사", "현장"];

const EVAL_TONE: Record<EvalGrade, string> = {
  HP: "bg-signal-greenBg text-signal-green",
  SP: "bg-signal-blueBg text-signal-blue",
  IP: "bg-canvas text-ink-500",
  A:  "bg-signal-amberBg text-signal-amber",
  C:  "bg-signal-redBg text-signal-red",
  "-":"bg-canvas text-ink-400",
};

function emoneyColor(v: number) {
  if (v >= 1)  return "bg-signal-greenBg text-signal-green";
  if (v >= 0)  return "bg-canvas text-ink-500";
  return "bg-signal-redBg text-signal-red";
}

export function TalentClient() {
  const [q,        setQ]       = useState("");
  const [group,    setGroup]   = useState("전체");
  const [workLoc,  setWorkLoc] = useState("전체");
  const [hiPo,     setHiPo]   = useState(false);
  const [atRisk,   setAtRisk]  = useState(false);
  const [selected, setSelected] = useState<CandidateInternal | null>(null);

  const view = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return SAMPLE_EMPLOYEES.filter((e) => {
      const okG  = group   === "전체" || e.gradeGroup    === group;
      const okW  = workLoc === "전체" || e.workLocation  === workLoc;
      const okH  = !hiPo   || e.avgEval === "HP" || e.avgEval === "SP" || e.managerClass;
      const okR  = !atRisk || attritionRisk(e) !== null;
      const hay  = [e.name, e.orgGroup, e.orgName, e.grade, e.workLocation, e.mbti, ...e.job, ...e.strengths]
                    .join(" ").toLowerCase();
      const okQ  = !ql || hay.includes(ql);
      return okG && okW && okH && okR && okQ;
    });
  }, [q, group, workLoc, hiPo, atRisk]);

  const activeCount = SAMPLE_EMPLOYEES.filter(e => e.status === "재직자").length;

  return (
    <>
      <PageHeader
        title="내부 인재 풀"
        subtitle={`유통BG 전체 ${activeCount}명(재직자) 데이터. 행을 클릭하면 역량·DISC·컴스타일·강점 상세를 확인합니다.`}
      />

      <div className="space-y-4 px-8 py-6">
        {/* 툴바 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 검색 */}
          <div className="relative w-[280px]">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="이름·조직·직무·강점 검색"
              className="input pl-9"
            />
          </div>

          {/* 직급 필터 */}
          <div className="flex items-center gap-1">
            {GRADE_GROUPS.map((g) => (
              <button key={g} onClick={() => setGroup(g)}
                className={cn("rounded-xl border px-2.5 py-1.5 text-[12px] font-semibold transition",
                  group === g ? "border-brand-200 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-500 hover:bg-canvas"
                )}>{g}</button>
            ))}
          </div>

          {/* 본사/현장 */}
          <div className="flex items-center gap-1">
            {WORK_LOCS.map((w) => (
              <button key={w} onClick={() => setWorkLoc(w)}
                className={cn("rounded-xl border px-2.5 py-1.5 text-[12px] font-semibold transition",
                  workLoc === w ? "border-brand-200 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-500 hover:bg-canvas"
                )}>{w}</button>
            ))}
          </div>

          {/* 토글 필터 */}
          <button onClick={() => setHiPo(v => !v)}
            className={cn("rounded-xl border px-2.5 py-1.5 text-[12px] font-semibold transition",
              hiPo ? "border-signal-green bg-signal-greenBg text-signal-green" : "border-line bg-surface text-ink-500 hover:bg-canvas"
            )}>⭐ 고성과·핵심</button>

          <button onClick={() => setAtRisk(v => !v)}
            className={cn("rounded-xl border px-2.5 py-1.5 text-[12px] font-semibold transition",
              atRisk ? "border-signal-red bg-signal-redBg text-signal-red" : "border-line bg-surface text-ink-500 hover:bg-canvas"
            )}>⚠️ 이탈 위험</button>
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
                  <th className="px-4 py-3">대표 강점</th>
                  <th className="px-4 py-3">상태·표식</th>
                </tr>
              </thead>
              <tbody>
                {view.map((e) => {
                  const risk   = attritionRisk(e);
                  const emoney = e.emoney ?? 0;
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

      <EmployeeDetail emp={selected} onClose={() => setSelected(null)} />
    </>
  );
}
