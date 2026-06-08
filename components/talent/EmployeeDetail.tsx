"use client";

import { useMemo, useState } from "react";
import { Drawer, DrawerHeader } from "@/components/ui/Drawer";
import { Radar } from "@/components/ui/dataviz";
import { metricToScore, classifyPerformanceType, PerformanceType, getPerformanceTypeBasis } from "@/lib/scoring";
import {
  analyzePersonal, recommendBosses, recommendSubordinates,
  EXT_TYPE_META, FitResult, RecommendedPerson, ExtendedType,
} from "@/lib/analysis";
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

const DISC_BAR: Record<string, string> = {
  D: "bg-signal-red", I: "bg-signal-amber", S: "bg-signal-green", C: "bg-signal-blue",
};

const COM_LABEL: Record<string, string> = {
  AC: "Action — 실행·추진",
  PR: "Process — 체계·관리",
  PE: "People — 관계·조화",
  ID: "Idea — 창의·혁신",
};

const COM_BAR: Record<string, string> = {
  AC: "bg-signal-green", PR: "bg-signal-blue", PE: "bg-signal-amber", ID: "bg-brand-500",
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

const VERDICT_STYLE: Record<FitResult["verdict"], string> = {
  "즉시 추천":   "bg-signal-greenBg text-signal-green",
  "추천 가능":   "bg-signal-blueBg text-signal-blue",
  "조건부 추천": "bg-signal-amberBg text-signal-amber",
  "별도 검토":   "bg-signal-redBg text-signal-red",
};

const HR_STYLE: Record<FitResult["hrIntervention"], string> = {
  낮음: "text-signal-green",
  보통: "text-signal-amber",
  높음: "text-signal-red",
};

const EXT_TYPE_CHIP: Record<ExtendedType, string> = {
  고성과형: "bg-signal-greenBg text-signal-green",
  프로세스형: "bg-signal-blueBg text-signal-blue",
  사람형: "bg-signal-amberBg text-signal-amber",
  전략형: "bg-brand-50 text-brand-700",
  개척형: "bg-signal-redBg text-signal-red",
};

const EXT_TYPE_BAR: Record<ExtendedType, string> = {
  고성과형: "bg-signal-green",
  프로세스형: "bg-signal-blue",
  사람형: "bg-signal-amber",
  전략형: "bg-brand-700",
  개척형: "bg-signal-red",
};

function emoneyColor(v: number) {
  if (v >= 1) return { chip: "bg-signal-greenBg text-signal-green", label: "우수" };
  if (v >= 0) return { chip: "bg-canvas text-ink-500",              label: "보통" };
  return             { chip: "bg-signal-redBg text-signal-red",     label: "주의" };
}

// ── 메인 컴포넌트 ──────────────────────────────
export function EmployeeDetail({
  emp, onClose, pool,
}: {
  emp: CandidateInternal | null;
  onClose: () => void;
  pool: CandidateInternal[];
}) {
  return (
    <Drawer open={Boolean(emp)} onClose={onClose} width={820}>
      {emp && <Body key={emp.id} emp={emp} onClose={onClose} pool={pool} />}
    </Drawer>
  );
}

// ── Body ────────────────────────────────────────
function Body({ emp, onClose, pool }: { emp: CandidateInternal; onClose: () => void; pool: CandidateInternal[] }) {
  const [activeTab, setActiveTab] = useState<number | null>(null);

  const radarData   = METRIC_KEYS.map((k) => ({ label: k, value: metricToScore(emp.metrics[k]) }));
  const discMax     = Math.max(...Object.values(emp.discScores));
  const comMax      = emp.comStyle ? Math.max(...Object.values(emp.comStyle)) : 0;
  const risk        = attritionRisk(emp);
  const emoney      = emp.emoney ?? 0;
  const emoneyStyle = emoneyColor(emoney);
  const ptype       = classifyPerformanceType(emp);
  const basis       = ptype ? getPerformanceTypeBasis(emp, ptype) : null;

  const personal = useMemo(() => analyzePersonal(emp), [emp]);

  const bossRecs = useMemo(
    () => (activeTab === 1 ? recommendBosses(emp, pool) : []),
    [activeTab, emp, pool],
  );
  const subRecs = useMemo(
    () => (activeTab === 2 ? recommendSubordinates(emp, pool) : []),
    [activeTab, emp, pool],
  );

  const TAB_LABELS = ["개인 유형 분석", "상사 추천", "부하 추천", "조합 리스크"];

  return (
    <>
      <DrawerHeader
        title={emp.name}
        subtitle={`${emp.grade} · ${emp.orgName} · ${emp.workLocation || ""}`}
        onClose={onClose}
        badge={<span className={cn("chip", EVAL_TONE[emp.avgEval])}>평가 {emp.avgEval}</span>}
      />

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">

        {/* ── 기본 정보 ── */}
        <div className="card p-4">
          <div className="mb-3 text-[13px] font-bold text-ink-900">기본 정보</div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "조직구분",     value: emp.orgGroup    || "-" },
              { label: "조직명",       value: emp.orgName     || "-" },
              { label: "본사/현장",    value: emp.workLocation|| "-" },
              { label: "직급",         value: emp.grade       || "-" },
              { label: "최종 승진",    value: emp.lastPromotion ? emp.lastPromotion.slice(0, 7) : "-" },
              { label: "현 직위 체류", value: `${emp.gradeYears}년` },
              {
                label: "출신 학교",
                value: emp.school
                  ? `${emp.school}${emp.schoolTier ? ` (${emp.schoolTier})` : ""}`
                  : "-",
              },
              { label: "전공",         value: emp.major || "-" },
              { label: "성과 유형",    value: ptype || "-", colored: true },
            ].map(({ label, value, colored }) => (
              <div key={label} className="rounded-xl bg-canvas px-3 py-2.5">
                <div className="text-[10.5px] text-ink-400 mb-0.5">{label}</div>
                <div className={cn(
                  "text-[13px] font-semibold",
                  colored && ptype
                    ? PERF_TYPE_STYLE[ptype].chip.split(" ").find(c => c.startsWith("text-")) ?? "text-ink-900"
                    : "text-ink-900"
                )}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 뱃지 행 ── */}
        <div className="flex flex-wrap gap-2">
          {ptype && (
            <span className={cn("chip font-bold text-[12px]", PERF_TYPE_STYLE[ptype].chip)}>
              ★ {ptype}
            </span>
          )}
          <span className={cn("chip font-bold", emoneyStyle.chip)}>
            E머니 {emoney > 0 ? "+" : ""}{emoney} · {emoneyStyle.label}
          </span>
          <span className="chip bg-brand-50 text-brand-700">
            {emp.disc}형 · {DISC_LABEL[emp.disc]}
          </span>
          <span className="chip bg-canvas text-ink-500">{emp.mbti}</span>
          <span className="chip bg-canvas text-ink-500">언어 {emp.lang}</span>
          <span className="chip bg-canvas text-ink-500">수리 {emp.math}</span>
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
              return (
                <div key={d}>
                  <div className="mb-1 flex justify-between text-[11.5px]">
                    <span className={cn("font-medium", isDom ? "font-bold text-ink-900" : "text-ink-700")}>
                      {isDom && "★ "}{d} · {DISC_LABEL[d]}
                    </span>
                    <span className={cn("font-semibold", isDom ? "text-ink-900" : "text-ink-500")}>{val}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
                    <div
                      className={cn("h-full rounded-full transition-all", DISC_BAR[d], isDom ? "opacity-100" : "opacity-60")}
                      style={{ width: `${(val / 14) * 100}%` }}
                    />
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
                return (
                  <div key={k}>
                    <div className="mb-1 flex justify-between text-[11.5px]">
                      <span className={cn("font-medium", isDom ? "font-bold text-ink-900" : "text-ink-700")}>
                        {isDom && "★ "}{k} · {COM_LABEL[k]}
                      </span>
                      <span className={cn("font-bold", isDom ? "text-ink-900" : "text-ink-500")}>{val}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
                      <div
                        className={cn("h-full rounded-full transition-all", COM_BAR[k], isDom ? "opacity-100" : "opacity-60")}
                        style={{ width: `${(val / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 강점 + 성과 유형 (판정 근거 포함) ── */}
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

          {/* 성과 유형 + 판정 근거 */}
          <div className={cn("card p-4", ptype ? "" : "border-dashed")}>
            <div className="mb-2 flex items-center gap-1.5">
              <IconSpark className="h-4 w-4 text-brand-700" />
              <div className="text-[13px] font-bold text-ink-900">성과 유형</div>
            </div>
            {ptype && basis ? (
              <>
                <span className={cn("chip font-bold text-[13px]", PERF_TYPE_STYLE[ptype].chip)}>
                  {ptype}
                </span>

                {/* 판정 근거 */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[10.5px] font-bold uppercase tracking-wide text-ink-400">판정 근거</div>
                  <div className="space-y-1">
                    <div className="flex gap-2 text-[11.5px]">
                      <span className="w-16 shrink-0 text-ink-400">DISC</span>
                      <span className="text-ink-700">{basis.discBasis}
                        {basis.discScore > 0 && <span className="ml-1 text-ink-400">({basis.discScore}점)</span>}
                      </span>
                    </div>
                    {basis.comStyleBasis && (
                      <div className="flex gap-2 text-[11.5px]">
                        <span className="w-16 shrink-0 text-ink-400">컴스타일</span>
                        <span className="text-ink-700">{basis.comStyleBasis}
                          {basis.comStyleScore != null && <span className="ml-1 text-ink-400">({basis.comStyleScore}점)</span>}
                        </span>
                      </div>
                    )}
                    {emp.mbti && (
                      <div className="flex gap-2 text-[11.5px]">
                        <span className="w-16 shrink-0 text-ink-400">MBTI</span>
                        <span className="text-ink-700">
                          {emp.mbti}
                          {basis.mbtiBasis.length > 0 && <span className="ml-1 text-ink-400">— {basis.mbtiBasis.join("·")}</span>}
                        </span>
                      </div>
                    )}
                    {basis.matchedStrengths.length > 0 && (
                      <div className="flex gap-2 text-[11.5px]">
                        <span className="w-16 shrink-0 text-ink-400">매칭 강점</span>
                        <span className="text-ink-700">{basis.matchedStrengths.join("·")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-[12px] text-ink-400 leading-relaxed mt-2">
                판별 기준에 완전히 부합하는 유형이 없습니다.
              </p>
            )}
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

        {/* ══════════════════════════════════════════
            고급 분석 탭 (Premium Feature)
        ══════════════════════════════════════════ */}
        <div className="overflow-hidden rounded-2xl border border-brand-200">
          {/* 헤더 */}
          <div className="flex items-center gap-2 border-b border-brand-200 bg-brand-50 px-4 py-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand-700">고급 분석</span>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
              Premium
            </span>
          </div>

          {/* 탭 버튼 */}
          <div className="flex border-b border-line bg-surface px-3 pt-2 gap-1">
            {TAB_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(activeTab === i ? null : i)}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-semibold rounded-t-lg border-x border-t transition",
                  activeTab === i
                    ? "border-brand-200 bg-surface text-brand-700"
                    : "border-transparent bg-transparent text-ink-400 hover:text-ink-700",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 탭 패널 */}
          {activeTab === 0 && (
            <TabPersonalAnalysis analysis={personal} />
          )}
          {activeTab === 1 && (
            <TabBossRecommend recs={bossRecs} emp={emp} />
          )}
          {activeTab === 2 && (
            <TabSubRecommend recs={subRecs} emp={emp} />
          )}
          {activeTab === 3 && (
            <TabRiskAnalysis analysis={personal} emp={emp} />
          )}
          {activeTab === null && (
            <div className="px-4 py-6 text-center text-[12px] text-ink-400">
              탭을 선택하면 심층 분석 결과를 확인할 수 있습니다
            </div>
          )}
        </div>

      </div>
    </>
  );
}

// ── 탭 1: 개인 유형 분석 ──────────────────────────
function TabPersonalAnalysis({ analysis }: { analysis: ReturnType<typeof analyzePersonal> }) {
  const meta = EXT_TYPE_META[analysis.coreType];
  return (
    <div className="space-y-5 p-4">

      {/* 핵심 / 보조 유형 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <div className="text-[10.5px] text-ink-400 mb-1">핵심 유형</div>
          <span className={cn("chip font-bold text-[13px]", EXT_TYPE_CHIP[analysis.coreType])}>
            {analysis.coreType}
          </span>
        </div>
        {analysis.subTypes.length > 0 && (
          <div>
            <div className="text-[10.5px] text-ink-400 mb-1">보조 유형</div>
            <div className="flex gap-1">
              {analysis.subTypes.map(t => (
                <span key={t} className={cn("chip text-[11px]", EXT_TYPE_CHIP[t])}>{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-[12px] text-ink-500 leading-relaxed">{meta.definition}</p>

      {/* 유형 점수 바 */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-ink-400 uppercase tracking-wide">유형별 점수</div>
        {analysis.typeScores.map(({ type, score, signals }) => (
          <div key={type}>
            <div className="mb-0.5 flex justify-between text-[11.5px]">
              <span className={cn("font-medium", type === analysis.coreType ? "font-bold text-ink-900" : "text-ink-600")}>
                {type}
              </span>
              <span className="text-ink-500">{score}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className={cn("h-full rounded-full", EXT_TYPE_BAR[type])}
                style={{ width: `${score}%` }}
              />
            </div>
            {type === analysis.coreType && signals.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {signals.map((s, i) => (
                  <span key={i} className="rounded-md bg-canvas px-1.5 py-0.5 text-[10.5px] text-ink-500">{s}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 업무 강점 / 협업 리스크 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-signal-greenBg p-3">
          <div className="mb-1.5 text-[11px] font-bold text-signal-green">업무 강점</div>
          <ul className="space-y-1">
            {meta.workStrengths.map((s, i) => (
              <li key={i} className="flex gap-1.5 text-[11.5px] text-ink-700">
                <span className="mt-0.5 text-signal-green">✓</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-signal-amberBg p-3">
          <div className="mb-1.5 text-[11px] font-bold text-signal-amber">협업 리스크</div>
          <ul className="space-y-1">
            {meta.collabRisks.map((s, i) => (
              <li key={i} className="flex gap-1.5 text-[11.5px] text-ink-700">
                <span className="mt-0.5 text-signal-amber">!</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 잘 맞는 상사/부하 유형 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-canvas p-3">
          <div className="mb-1.5 text-[11px] font-bold text-ink-600">잘 맞는 상사 유형</div>
          <div className="flex flex-wrap gap-1">
            {meta.goodBossTypes.map(t => (
              <span key={t} className={cn("chip text-[11px]", EXT_TYPE_CHIP[t as ExtendedType] ?? "bg-canvas text-ink-500")}>{t}</span>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-canvas p-3">
          <div className="mb-1.5 text-[11px] font-bold text-ink-600">잘 맞는 부하 유형</div>
          <div className="flex flex-wrap gap-1">
            {meta.goodSubTypes.map(t => (
              <span key={t} className={cn("chip text-[11px]", EXT_TYPE_CHIP[t as ExtendedType] ?? "bg-canvas text-ink-500")}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 관리 팁 */}
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
        <div className="mb-1.5 text-[11px] font-bold text-brand-700">관리 팁</div>
        <ul className="space-y-1">
          {meta.managementTips.map((s, i) => (
            <li key={i} className="flex gap-1.5 text-[11.5px] text-ink-700">
              <span className="mt-0.5 text-brand-400">→</span>{s}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}

// ── 탭 2: 상사 추천 ───────────────────────────────
function TabBossRecommend({ recs, emp }: { recs: RecommendedPerson[]; emp: CandidateInternal }) {
  if (recs.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-[12px] text-ink-400">
        {emp.gradeGroup === "임원" ? "임원급은 상사 추천 대상이 없습니다" : "분석 중..."}
      </div>
    );
  }
  return (
    <div className="space-y-3 p-4">
      <div className="text-[11px] text-ink-400">
        {emp.name}에게 맞는 상사 추천 — Fit 점수 기준 상위 {recs.length}명
      </div>
      {recs.map(({ emp: boss, fit, coreType }, idx) => (
        <RecommendCard key={boss.id} rank={idx + 1} person={boss} fit={fit} coreType={coreType} role="boss" />
      ))}
    </div>
  );
}

// ── 탭 3: 부하 추천 ───────────────────────────────
function TabSubRecommend({ recs, emp }: { recs: RecommendedPerson[]; emp: CandidateInternal }) {
  if (recs.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-[12px] text-ink-400">
        {emp.gradeGroup === "사원급" ? "사원급은 부하 추천 대상이 없습니다" : "분석 중..."}
      </div>
    );
  }
  return (
    <div className="space-y-3 p-4">
      <div className="text-[11px] text-ink-400">
        {emp.name}과 함께할 부하 추천 — Fit 점수 기준 상위 {recs.length}명
      </div>
      {recs.map(({ emp: sub, fit, coreType }, idx) => (
        <RecommendCard key={sub.id} rank={idx + 1} person={sub} fit={fit} coreType={coreType} role="sub" />
      ))}
    </div>
  );
}

// ── 추천 카드 공통 ────────────────────────────────
function RecommendCard({
  rank, person, fit, coreType, role,
}: {
  rank: number;
  person: CandidateInternal;
  fit: FitResult;
  coreType: ExtendedType;
  role: "boss" | "sub";
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      {/* 헤더 행 */}
      <div
        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-canvas transition"
        onClick={() => setOpen(v => !v)}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-ink-900">{person.name}</span>
            <span className="text-[11.5px] text-ink-500">{person.grade} · {person.orgName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn("chip text-[10.5px]", EXT_TYPE_CHIP[coreType])}>{coreType}</span>
          <span className="text-[13px] font-bold text-ink-900">{fit.totalScore}점</span>
          <span className={cn("chip text-[10.5px]", VERDICT_STYLE[fit.verdict])}>{fit.verdict}</span>
          <span className="text-[11px] text-ink-400">{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* 상세 펼치기 */}
      {open && (
        <div className="border-t border-line px-3 py-3 space-y-3 bg-canvas">
          {/* 점수 분해 */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(fit.breakdown).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-surface px-2 py-1 text-center">
                <div className="text-[10px] text-ink-400">{k}</div>
                <div className="text-[12px] font-bold text-ink-700">{v}</div>
              </div>
            ))}
          </div>

          {/* 잘 맞는 이유 */}
          {fit.goodReasons.length > 0 && (
            <div>
              <div className="mb-1 text-[10.5px] font-bold text-signal-green">잘 맞는 이유</div>
              {fit.goodReasons.map((r, i) => (
                <div key={i} className="flex gap-1.5 text-[11.5px] text-ink-700">
                  <span className="text-signal-green">✓</span>{r}
                </div>
              ))}
            </div>
          )}

          {/* 충돌 가능성 */}
          {fit.conflictRisks.length > 0 && (
            <div>
              <div className="mb-1 text-[10.5px] font-bold text-signal-amber">충돌 가능성</div>
              {fit.conflictRisks.map((r, i) => (
                <div key={i} className="flex gap-1.5 text-[11.5px] text-ink-700">
                  <span className="text-signal-amber">!</span>{r}
                </div>
              ))}
            </div>
          )}

          {/* 관리 포인트 */}
          <div>
            <div className="mb-1 text-[10.5px] font-bold text-brand-700">
              {role === "boss" ? "상사" : "상사"}가 주의할 점
            </div>
            {fit.bossNotes.map((n, i) => (
              <div key={i} className="flex gap-1.5 text-[11.5px] text-ink-700">
                <span className="text-brand-400">→</span>{n}
              </div>
            ))}
          </div>

          {/* HR 개입 */}
          <div className="text-[11px] text-ink-400">
            HR 개입 필요:
            <span className={cn("ml-1 font-semibold", HR_STYLE[fit.hrIntervention])}>
              {fit.hrIntervention}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 탭 4: 조합 리스크 분석 ────────────────────────
function TabRiskAnalysis({ analysis, emp }: { analysis: ReturnType<typeof analyzePersonal>; emp: CandidateInternal }) {
  const meta = EXT_TYPE_META[analysis.coreType];
  const risk = attritionRisk(emp);

  return (
    <div className="space-y-4 p-4">

      {/* 이 유형에서 주의할 조합 */}
      <div className="rounded-xl bg-signal-redBg p-3">
        <div className="mb-2 text-[11px] font-bold text-signal-red">주의해야 할 상사 조합</div>
        <ul className="space-y-1.5">
          {meta.warnCombinations.map((w, i) => (
            <li key={i} className="flex gap-2 text-[11.5px] text-ink-700">
              <span className="mt-0.5 text-signal-red shrink-0">⚠</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 현재 이탈 위험 */}
      <div className={cn("rounded-xl p-3", risk ? "bg-signal-amberBg" : "bg-signal-greenBg")}>
        <div className={cn("mb-1.5 text-[11px] font-bold", risk ? "text-signal-amber" : "text-signal-green")}>
          현재 이탈 위험 상태
        </div>
        {risk ? (
          <p className="text-[11.5px] text-ink-700">
            <strong>{risk}</strong> 감지됨.{" "}
            {risk === "승진적체"
              ? `현 직위 체류 ${emp.gradeYears}년으로 기준 초과. 승진 기회 또는 역할 재설계 검토 필요.`
              : "최근 평가 C등급. 성과 원인 파악 및 1:1 코칭 권장."}
          </p>
        ) : (
          <p className="text-[11.5px] text-ink-700">현재 특이 이탈 신호 없음</p>
        )}
      </div>

      {/* DISC 기반 충돌 분석 */}
      <div className="rounded-xl bg-canvas p-3">
        <div className="mb-2 text-[11px] font-bold text-ink-600">DISC 기반 충돌 시나리오</div>
        <div className="space-y-2">
          {emp.disc === "D" && (
            <>
              <RiskRow warn="D 상사 + D 부하" desc="경쟁·주도권 충돌 가능. 역할 경계 명확화 필요." />
              <RiskRow warn="C 상사 + D 부하" desc="신중 vs 추진 속도 갈등. 사전 합의 권장." />
            </>
          )}
          {emp.disc === "S" && (
            <>
              <RiskRow warn="D 상사 + S 부하" desc="압박감 위험. 상사는 우선순위·기한 명확화 필요." />
              <RiskRow warn="P 성향 상사 + S 부하" desc="방치감 위험. 정기 체크인 구조화 필요." />
            </>
          )}
          {emp.disc === "C" && (
            <>
              <RiskRow warn="D 상사 + C 부하" desc="속도 vs 검토 갈등. 검토 범위 사전 합의 필요." />
              <RiskRow warn="I 상사 + C 부하" desc="기준 불명확성 리스크. 명문화된 기준 요청 권장." />
            </>
          )}
          {emp.disc === "I" && (
            <>
              <RiskRow warn="C 상사 + I 부하" desc="디테일 요구 vs 빠른 실행 욕구 충돌." />
              <RiskRow warn="J 성향 상사 + I 부하" desc="일정·계획 방식 갈등. 자유도 범위 합의 필요." />
            </>
          )}
        </div>
      </div>

      {/* 관리 처방 */}
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
        <div className="mb-2 text-[11px] font-bold text-brand-700">이 유형 관리 처방</div>
        <ul className="space-y-1.5">
          {meta.managementTips.map((t, i) => (
            <li key={i} className="flex gap-2 text-[11.5px] text-ink-700">
              <span className="mt-0.5 text-brand-400 shrink-0">→</span>{t}
            </li>
          ))}
        </ul>
      </div>

      {/* HR 주의사항 */}
      <div className="rounded-xl bg-canvas px-3 py-2.5 text-[11px] text-ink-400 leading-relaxed">
        이 분석은 HR 의사결정 보조 자료입니다. 최종 배치·평가 판단은 실제 성과·면담·리더 평가와 함께 종합 검토해야 합니다.
      </div>

    </div>
  );
}

function RiskRow({ warn, desc }: { warn: string; desc: string }) {
  return (
    <div className="rounded-lg bg-surface px-2.5 py-2">
      <div className="text-[11.5px] font-semibold text-ink-700">{warn}</div>
      <div className="text-[11px] text-ink-500">{desc}</div>
    </div>
  );
}
