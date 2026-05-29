"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { SAMPLE_EMPLOYEES } from "@/lib/data/employees";
import { CandidateInternal, EvalGrade } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmployeeDetail } from "./EmployeeDetail";
import { IconSearch, IconShield } from "@/components/ui/icons";

const GRADE_GROUPS = [
  "전체",
  "사원급",
  "대리급",
  "과장급",
  "차장급",
  "부장급",
  "임원",
];

const EVAL_TONE: Record<EvalGrade, string> = {
  HP: "bg-signal-greenBg text-signal-green",
  SP: "bg-signal-blueBg text-signal-blue",
  IP: "bg-canvas text-ink-500",
  A: "bg-signal-amberBg text-signal-amber",
  C: "bg-signal-redBg text-signal-red",
  "-": "bg-canvas text-ink-400",
};

export function TalentClient() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("전체");
  const [hiPo, setHiPo] = useState(false);
  const [selected, setSelected] = useState<CandidateInternal | null>(null);

  const view = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return SAMPLE_EMPLOYEES.filter((e) => {
      const okG = group === "전체" || e.gradeGroup === group;
      const okH =
        !hiPo || e.avgEval === "HP" || e.avgEval === "SP" || e.managerClass;
      const hay = [e.name, e.orgName, e.mbti, ...e.job, ...e.strengths]
        .join(" ")
        .toLowerCase();
      const okQ = !ql || hay.includes(ql);
      return okG && okH && okQ;
    });
  }, [q, group, hiPo]);

  return (
    <>
      <PageHeader
        title="내부 인재 풀"
        subtitle="유통BG 핵심 인재 데이터베이스. 행을 클릭하면 역량·DISC·강점 상세를 확인합니다."
        actions={
          <span className="chip bg-canvas text-ink-500">
            <IconShield className="h-3.5 w-3.5 text-signal-blue" />
            전원 가상 인물 · 시연 데이터
          </span>
        }
      />

      <div className="space-y-5 px-8 py-6">
        {/* 툴바 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-[320px]">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="이름·조직·직무·강점 검색"
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {GRADE_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-[12.5px] font-semibold transition",
                  group === g
                    ? "border-brand-200 bg-brand-50 text-brand-700"
                    : "border-line bg-surface text-ink-500 hover:bg-canvas"
                )}
              >
                {g}
              </button>
            ))}
            <button
              onClick={() => setHiPo((v) => !v)}
              className={cn(
                "rounded-xl border px-3 py-2 text-[12.5px] font-semibold transition",
                hiPo
                  ? "border-signal-green bg-signal-greenBg text-signal-green"
                  : "border-line bg-surface text-ink-500 hover:bg-canvas"
              )}
            >
              고성과·핵심
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line bg-canvas text-[11.5px] font-semibold uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">직급</th>
                <th className="px-4 py-3">조직</th>
                <th className="px-4 py-3">DISC</th>
                <th className="px-4 py-3">평가</th>
                <th className="px-4 py-3">대표 강점</th>
                <th className="px-4 py-3">표식</th>
              </tr>
            </thead>
            <tbody>
              {view.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="cursor-pointer border-b border-line/60 text-[13px] transition last:border-0 hover:bg-canvas"
                >
                  <td className="px-4 py-3">
                    <span className="font-semibold text-ink-900">{e.name}</span>
                    <span className="ml-1.5 text-[11px] text-ink-400">
                      {e.age}세
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{e.grade}</td>
                  <td className="px-4 py-3 text-ink-500">{e.orgName}</td>
                  <td className="px-4 py-3">
                    <span className="chip bg-brand-50 text-brand-700">
                      {e.disc}형
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("chip", EVAL_TONE[e.avgEval])}>
                      {e.avgEval}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {e.strengths.slice(0, 3).join(" · ")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {e.ebgPass === "O" && (
                        <span className="chip bg-signal-greenBg text-signal-green">
                          EBG
                        </span>
                      )}
                      {e.managerClass && (
                        <span className="chip bg-signal-amberBg text-signal-amber">
                          경영자반
                        </span>
                      )}
                      {e.sproutClass && (
                        <span className="chip bg-canvas text-ink-500">새싹</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!view.length && (
            <div className="py-14 text-center text-[13px] text-ink-400">
              조건에 맞는 인재가 없습니다
            </div>
          )}
        </div>

        <p className="text-center text-[11.5px] text-ink-400">
          총 {SAMPLE_EMPLOYEES.length}명 · 표시 {view.length}명 · 전원 가상 인물
          시연 데이터
        </p>
      </div>

      <EmployeeDetail emp={selected} onClose={() => setSelected(null)} />
    </>
  );
}
