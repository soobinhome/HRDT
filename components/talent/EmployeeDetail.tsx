"use client";

import { Drawer, DrawerHeader } from "@/components/ui/Drawer";
import { Radar } from "@/components/ui/dataviz";
import { metricToScore, classifyPerformanceType, PerformanceType } from "@/lib/scoring";
import { CandidateInternal, METRIC_KEYS, EvalGrade } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconCheck, IconWarn, IconSpark } from "@/components/ui/icons";
import { attritionRisk } from "./TalentClient";

// ── 상수 ──────────────────────────────────────
const EVAL_TONE: Record<EvalGrade, string> = {
  HP: "bg-signal-greenBg text-signal-green",
  SP: "bg-signal-blueBg text-signal-blue",
  IP: "bg-canvas text-ink-500",
  A:  "bg-signal-amberBg text-signal-amber",
  C:  "bg-signal-redBg text-signal-red",
  "-":"bg-canvas text-ink-400",
};

const DISC_LABEL: Record<string, string> = {
  D: "주도형", I: "사교형", S: "안정형", C: "신중형",
};

const COM_LABEL: Record<string, string> = {
  AC: "Action — 실행·추진",
  PR: "Process — 체계·관리",
  PE: "People — 관계·조화",
  ID: "Idea — 창의·혁신",
};

const METRIC_SYMBOL: Record<string, string> = {
  "◎": "text-signal-green", "○": "text-brand-700",
  "△": "text-signal-amber", "X": "text-signal-red", "-": "text-ink-300",
};

const PERF_TYPE_STYLE: Record<PerformanceType, { chip: string; desc: string }> = {
  "고성과 유형": {
    chip: "bg-signal-greenBg text-signal-green",
    desc: "실행·추진 중심. 성취·책임·승부 강점, AC/PE 컴스타일, ExTx MBTI, D/I DISC.",
  },
  "프로세스형": {
    chip: "bg-signal-blueBg text-signal-blue",
    desc: "체계·관리 중심. 분석·체계·집중 강점, PR 컴스타일, xSTJ MBTI, C/S DISC.",
  },
  전략형: {
    chip: "bg-brand-50 text-brand-700",
    desc: "창의·혁신 중심. 전략·발상·미래지향 강점, ID 컴스타일, xNTx MBTI, D/I DISC.",
  },
  피플형: {
    chip: "bg-signal-amberBg text-signal-amber",
    desc: "관계·조화 중심. 개발·절친·개별화 강점, PE 컴스타일, I DISC.",
  },
};

function emoneyColor(v: number) {
  if (v >= 1)  return { chip: "bg-signal-greenBg text-signal-green", label: "우수" };
  if (v >= 0)  return { chip: "bg-canvas text-ink-500",              label: "보통" };
  return                { chip: "bg-signal-redBg text-signal-red",    label: "주의" };
}

// ── 메인 컴포넌트 ──────────────────────────────
export function EmployeeDetail({
  emp, onClose,
}: {
  emp: CandidateInternal | null;
  onClose: () => void;
}) {
  return (
    <Drawer open={Boolean(emp)} onClose={onClose} width={800}>
      {emp && <Body emp={emp} onClose={onClose} />}
    </Drawer>
  );
}

function Body({ emp, onClose }: { emp: CandidateInternal; onClose: () => void }) {
  const radarData   = METRIC_KEYS.map((k) => ({ label: k, value: metricToScore(emp.metrics[k]) }));
  const discMax     = Math.max(...Object.values(emp.discScores));
  const comMax      = emp.comStyle ? Math.max(...Object.values(emp.comStyle)) : 0;
  const risk        = attritionRisk(emp);
  const emoney      = emp.emoney ?? 0;
  const emoneyStyle = emoneyColor(emoney);
  const ptype       = classifyPerformanceType(emp);

  return (
    <>
      <DrawerHeader
        title={emp.name}
        subtitle={`${emp.grade} · ${emp.orgName} · ${emp.workLocation || ""}`}
        onClose={onClose}
        badge={<span className={cn("chip", EVAL_TONE[emp.avgEval])}>평가 {emp.avgEval}</span>}
      />

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">

        {/* ── 기본 정보 카드 ── */}
        <div className="card p-4">
          <div className="mb-3 text-[13px] font-bold text-ink-900">기본 정보</div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "조직구분",    value: emp.orgGroup    || "-" },
              { label: "조직명",      value: emp.orgName     || "-" },
              { label: "본사/현장",   value: emp.workLocation|| "-" },
              { label: "직급",        value: emp.grade       || "-" },
              { label: "최종 승진",   value: emp.lastPromotion ? emp.lastPromotion.slice(0, 7) : "-" },
              { label: "현 직위 체류", value: `${emp.gradeYears}년` },
              {
                label: "출신 학교",
                value: emp.school
                  ? `${emp.school}${emp.schoolTier ? ` (${emp.schoolTier})` : ""}`
                  : "-",
              },
              { label: "전공",        value: emp.major || "-" },
              { label: "성과 유형",   value: ptype || "-" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-canvas px-3 py-2.5">
                <div className="text-[10.5px] text-ink-400 mb-0.5">{label}</div>
                <div className={cn(
                  "text-[13px] font-semibold",
                  label === "성과 유형" && ptype
                    ? PERF_TYPE_STYLE[ptype].chip.split(" ").find(c => c.startsWith("text-")) ?? "text-ink-900"
                    : "text-ink-900"
                )}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 뱃지 행 ── */}
        <div className="flex flex-wrap gap-2">
          {/* 성과 유형 */}
          {ptype && (
            <span className={cn("chip font-bold text-[12px]", PERF_TYPE_STYLE[ptype].chip)}>
              ★ {ptype}
            </span>
          )}

          {/* E머니 */}
          <span className={cn("chip font-bold", emoneyStyle.chip)}>
            E머니 {emoney > 0 ? "+" : ""}{emoney} · {emoneyStyle.label}
          </span>

          {/* DISC */}
          <span className="chip bg-brand-50 text-brand-700">
            {emp.disc}형 · {DISC_LABEL[emp.disc]}
          </span>

          {/* MBTI */}
          <span className="chip bg-canvas text-ink-500">{emp.mbti}</span>

          {/* 언어/수리 */}
          <span className="chip bg-canvas text-ink-500">언어 {emp.lang}</span>
          <span className="chip bg-canvas text-ink-500">수리 {emp.math}</span>

          {/* 이탈 위험 */}
          {risk === "승진적체" && (
            <span className="chip bg-signal-amberBg text-signal-amber">
              <IconWarn className="h-3 w-3" /> 승진적체 주의
            </span>
          )}
          {risk === "평가하락" && (
            <span className="chip bg-signal-redBg text-signal-red">
              <IconWarn className="h-3 w-3" /> 평가하락 위험
            </span>
          )}

          {/* 표식 */}
          {emp.ebgPass === "O" && <span className="chip bg-signal-greenBg text-signal-green"><IconCheck className="h-3 w-3" /> EBG 통과</span>}
          {emp.managerClass   && <span className="chip bg-signal-amberBg text-signal-amber">경영자반</span>}
          {emp.sproutClass    && <span className="chip bg-canvas text-ink-500">새싹반</span>}
          {emp.groundExp      && <span className="chip bg-canvas text-ink-500">밑바닥 경험</span>}
        </div>

        {/* ── 역량 레이더 + DISC ── */}
        <div className="grid grid-cols-[1fr_220px] gap-4">
          <div className="card flex flex-col items-center p-4">
            <div className="self-start text-[13px] font-bold text-ink-900 mb-1">핵심 역량 프로필</div>
            <Radar data={radarData} size={210} />
          </div>
          <div className="card space-y-3 p-4">
            <div className="text-[13px] font-bold text-ink-900">DISC 성향</div>
            {(["D","I","S","C"] as const).map((d) => {
              const val = emp.discScores[d];
              const isDom = val === discMax;
              const barColor: Record<string, string> = {
                D: "bg-signal-red",
                I: "bg-signal-amber",
                S: "bg-signal-green",
                C: "bg-signal-blue",
              };
              return (
                <div key={d}>
                  <div className="mb-1 flex justify-between text-[11.5px]">
                    <span className={cn("font-medium", isDom ? "text-ink-900 font-bold" : "text-ink-700")}>
                      {isDom && "★ "}{d} · {DISC_LABEL[d]}
                    </span>
                    <span className={cn("font-semibold", isDom ? "text-ink-900" : "text-ink-500")}>{val}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
                    <div className={cn("h-full rounded-full opacity-80", isDom ? "opacity-100" : "", barColor[d])}
                      style={{ width: `${(val / 14) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 정성 역량 지표 ── */}
        <div className="card p-4">
          <div className="mb-3 text-[13px] font-bold text-ink-900">정성 역량 지표</div>
          <div className="grid grid-cols-3 gap-2">
            {METRIC_KEYS.map((k) => {
              const m = emp.metrics[k];
              return (
                <div key={k} className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2">
                  <span className="text-[12px] text-ink-700">{k}</span>
                  <span className={cn("text-[16px] font-bold", METRIC_SYMBOL[m] || "text-ink-400")}>{m}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 컴스타일 ── */}
        {emp.comStyle && (
          <div className="card p-4">
            <div className="mb-3 text-[13px] font-bold text-ink-900">컴스타일 (AC·PR·PE·ID)</div>
            <div className="space-y-2.5">
              {(["AC","PR","PE","ID"] as const).map((k) => {
                const val = emp.comStyle![k];
                const isDom = val === comMax;
                const comBarColor: Record<string, string> = {
                  AC: "bg-signal-green",
                  PR: "bg-signal-blue",
                  PE: "bg-signal-amber",
                  ID: "bg-brand-500",
                };
                return (
                  <div key={k}>
                    <div className="mb-1 flex justify-between text-[11.5px]">
                      <span className={cn("font-medium", isDom ? "text-ink-900 font-bold" : "text-ink-700")}>
                        {isDom && "★ "}{k} · {COM_LABEL[k]}
                      </span>
                      <span className={cn("font-bold", isDom ? "text-ink-900" : "text-ink-500")}>{val}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
                      <div className={cn("h-full rounded-full opacity-80", isDom ? "opacity-100" : "", comBarColor[k])}
                        style={{ width: `${(val / 20) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 강점 + 강점 유형 ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4">
            <div className="mb-2.5 text-[13px] font-bold text-ink-900">갤럽 강점 Top 5</div>
            <ul className="space-y-2">
              {emp.strengths.map((s, i) => (
                <li key={s} className="flex items-center gap-2 text-[12.5px] text-ink-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-50 text-[11px] font-bold text-brand-700">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
              {!emp.strengths.length && <li className="text-[12px] text-ink-400">데이터 없음</li>}
            </ul>
          </div>

          {/* 성과 유형 */}
          <div className={cn("card p-4", ptype ? "" : "border-dashed")}>
            <div className="mb-2 flex items-center gap-1.5">
              <IconSpark className="h-4 w-4 text-brand-700" />
              <div className="text-[13px] font-bold text-ink-900">성과 유형</div>
            </div>
            {ptype ? (
              <>
                <span className={cn("chip font-bold text-[13px]", PERF_TYPE_STYLE[ptype].chip)}>
                  {ptype}
                </span>
                <p className="mt-2 text-[12px] text-ink-500 leading-relaxed">
                  {PERF_TYPE_STYLE[ptype].desc}
                </p>
              </>
            ) : (
              <p className="text-[12px] text-ink-400 leading-relaxed">
                판별 기준에 완전히 부합하는 유형이 없습니다.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {emp.strengths.map(s => (
                <span key={s} className="rounded-lg bg-brand-50 px-2 py-1 text-[11px] text-brand-600">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── 이탈 위험 분석 ── */}
        {risk && (
          <div className={cn("rounded-2xl p-4", risk === "승진적체" ? "bg-signal-amberBg" : "bg-signal-redBg")}>
            <div className={cn("flex items-center gap-2 mb-2 text-[13px] font-bold",
              risk === "승진적체" ? "text-signal-amber" : "text-signal-red")}>
              <IconWarn className="h-4 w-4" />
              이탈 위험 감지 — {risk}
            </div>
            {risk === "승진적체" && (
              <p className="text-[12px] text-ink-700">
                현 직위 체류 <strong>{emp.gradeYears}년</strong>으로 {emp.gradeGroup} 평균 기준 초과.
                승진 기회 제공 또는 역할 재설계 검토가 필요합니다.
              </p>
            )}
            {risk === "평가하락" && (
              <p className="text-[12px] text-ink-700">
                최근 평가 등급 <strong>C</strong>. 성과 원인 파악 및 1:1 코칭·업무 재배치 검토를 권장합니다.
              </p>
            )}
          </div>
        )}

      </div>
    </>
  );
}
