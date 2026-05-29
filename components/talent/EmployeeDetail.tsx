"use client";

import { Drawer, DrawerHeader } from "@/components/ui/Drawer";
import { Radar } from "@/components/ui/dataviz";
import { metricToScore } from "@/lib/scoring";
import { CandidateInternal, METRIC_KEYS, EvalGrade } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconCheck, IconShield } from "@/components/ui/icons";

const EVAL_TONE: Record<EvalGrade, string> = {
  HP: "bg-signal-greenBg text-signal-green",
  SP: "bg-signal-blueBg text-signal-blue",
  IP: "bg-canvas text-ink-500",
  A: "bg-signal-amberBg text-signal-amber",
  C: "bg-signal-redBg text-signal-red",
  "-": "bg-canvas text-ink-400",
};

const DISC_LABEL: Record<string, string> = {
  D: "주도형",
  I: "사교형",
  S: "안정형",
  C: "신중형",
};

export function EmployeeDetail({
  emp,
  onClose,
}: {
  emp: CandidateInternal | null;
  onClose: () => void;
}) {
  return (
    <Drawer open={Boolean(emp)} onClose={onClose} width={720}>
      {emp && <Body emp={emp} onClose={onClose} />}
    </Drawer>
  );
}

function Body({
  emp,
  onClose,
}: {
  emp: CandidateInternal;
  onClose: () => void;
}) {
  const radarData = METRIC_KEYS.map((k) => ({
    label: k,
    value: metricToScore(emp.metrics[k]),
  }));

  const badges = [
    emp.ebgPass === "O" && "EBG 통과",
    emp.managerClass && "경영자반",
    emp.sproutClass && "새싹반",
    emp.groundExp && "밑바닥경험",
  ].filter(Boolean) as string[];

  const discMax = Math.max(...Object.values(emp.discScores));

  return (
    <>
      <DrawerHeader
        title={emp.name}
        subtitle={`${emp.grade} · ${emp.orgName} · ${emp.age}세`}
        onClose={onClose}
        badge={
          <span className={cn("chip", EVAL_TONE[emp.avgEval])}>
            평가 {emp.avgEval}
          </span>
        }
      />

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {/* 요약 */}
        <div className="flex flex-wrap gap-2">
          <span className="chip bg-brand-50 text-brand-700">
            {emp.disc}형 · {DISC_LABEL[emp.disc]}
          </span>
          <span className="chip bg-canvas text-ink-500">{emp.mbti}</span>
          <span className="chip bg-canvas text-ink-500">언어 {emp.lang}</span>
          <span className="chip bg-canvas text-ink-500">수리 {emp.math}</span>
          {badges.map((b) => (
            <span
              key={b}
              className="chip bg-signal-blueBg text-signal-blue"
            >
              <IconShield className="h-3 w-3" /> {b}
            </span>
          ))}
        </div>

        {/* 역량 레이더 + DISC */}
        <div className="grid grid-cols-[1fr_240px] gap-4">
          <div className="card flex flex-col items-center p-4">
            <div className="self-start text-[13px] font-bold text-ink-900">
              핵심 역량 프로필
            </div>
            <Radar data={radarData} size={220} />
          </div>
          <div className="card space-y-3 p-4">
            <div className="text-[13px] font-bold text-ink-900">DISC 성향</div>
            {(["D", "I", "S", "C"] as const).map((d) => {
              const v = emp.discScores[d];
              return (
                <div key={d}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="font-medium text-ink-700">
                      {d} · {DISC_LABEL[d]}
                    </span>
                    <span className="font-semibold text-ink-900">{v}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        v === discMax ? "bg-brand-700" : "bg-ink-300"
                      )}
                      style={{ width: `${(v / 10) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 역량 지표 표 */}
        <div className="card p-4">
          <div className="mb-3 text-[13px] font-bold text-ink-900">
            정성 역량 지표
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {METRIC_KEYS.map((k) => (
              <div
                key={k}
                className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2"
              >
                <span className="text-[12.5px] text-ink-700">{k}</span>
                <span className="text-[15px] font-bold text-ink-900">
                  {emp.metrics[k]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 강점 + 직무 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4">
            <div className="mb-2.5 text-[13px] font-bold text-ink-900">
              갤럽 강점
            </div>
            <ul className="space-y-2">
              {emp.strengths.map((s, i) => (
                <li
                  key={s}
                  className="flex items-center gap-2 text-[12.5px] text-ink-700"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-50 text-[11px] font-bold text-brand-700">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4">
            <div className="mb-2.5 text-[13px] font-bold text-ink-900">
              직무 경험
            </div>
            <div className="flex flex-wrap gap-1.5">
              {emp.job.map((j) => (
                <span
                  key={j}
                  className="chip bg-canvas text-ink-700"
                >
                  <IconCheck className="h-3 w-3 text-signal-green" />
                  {j}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="pb-2 text-center text-[11px] text-ink-400">
          전원 가상 인물 · 시연용 샘플 데이터입니다. 실명·민감 인사정보는
          포함되지 않습니다.
        </p>
      </div>
    </>
  );
}
