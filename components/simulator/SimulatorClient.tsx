"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/shell/PageHeader";
import { SAMPLE_EMPLOYEES } from "@/lib/data/employees";
import { resolveTaskProfile } from "@/lib/data/taskProfiles";
import { rankCandidates } from "@/lib/scoring";
import { ScoredCandidate, PostColor } from "@/lib/types";
import { ScoreRing } from "@/components/ui/dataviz";
import { cn, personName } from "@/lib/utils";
import {
  IconWarn,
  IconCheck,
  IconSimulator,
  IconArrowRight,
  IconBarChart,
} from "@/components/ui/icons";

// ── 리스크 레벨 ────────────────────────────────────────────
type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

function colorToRisk(c: PostColor): RiskLevel {
  if (c === "red") return "HIGH";
  if (c === "yellow") return "MEDIUM";
  return "LOW";
}

function scoreToRisk(score: number): RiskLevel {
  if (score >= 60) return "LOW";
  if (score >= 45) return "MEDIUM";
  return "HIGH";
}

const RISK_TONE: Record<RiskLevel, { label: string; color: string; bg: string; bar: string; hex: string }> = {
  HIGH: { label: "고위험", color: "text-signal-red", bg: "bg-signal-redBg", bar: "bg-signal-red", hex: "#FF3B30" },
  MEDIUM: { label: "중위험", color: "text-signal-amber", bg: "bg-signal-amberBg", bar: "bg-signal-amber", hex: "#FFC400" },
  LOW: { label: "저위험", color: "text-signal-green", bg: "bg-signal-greenBg", bar: "bg-signal-green", hex: "#16C46A" },
};

const RISK_SCORE: Record<RiskLevel, number> = { HIGH: 20, MEDIUM: 55, LOW: 85 };

// ── 비즈니스 영향 시나리오 텍스트 생성 ─────────────────────
function buildImpact(
  area: string,
  taskKey: string,
  before: RiskLevel,
  after: RiskLevel,
  candidateName: string,
  score: number
): { headline: string; details: string[]; period: string } {
  const improved = after !== before && RISK_SCORE[after] > RISK_SCORE[before];
  const worsen = after !== before && RISK_SCORE[after] < RISK_SCORE[before];

  const headline = improved
    ? `${area} 조직 리스크 ${before === "HIGH" ? "고위험 → " : ""}${RISK_TONE[after].label}으로 개선 예상`
    : worsen
    ? `${area} 조직 리스크 상승 주의 — 추가 육성 후 재검토 권고`
    : `${area} 현재 리스크 수준 유지 예상`;

  const details: string[] = [];

  if (score >= 60) {
    details.push(`${candidateName} 즉시 투입 가능 — 포스트 공백 기간 최소화`);
    details.push(`핵심역량·DISC 프로필 적합, 조직 적응 기간 1~2개월 예상`);
    details.push(`${taskKey} 과업 연속성 확보, 성과 저하 리스크 낮음`);
  } else if (score >= 45) {
    details.push(`${candidateName} 3~6개월 육성 트랙 병행 후 정식 배치 권고`);
    details.push(`일부 역량 갭 존재 — 코칭·OJT 병행 계획 필요`);
    details.push(`단기 성과 공백 가능성, 임시 대행 체계 검토 필요`);
  } else {
    details.push(`${candidateName} 현 시점 즉시 배치는 리스크 — 추가 검증 필요`);
    details.push(`외부 채용 병행 또는 다른 내부 후보 우선 검토 권고`);
    details.push(`현직자 유지 또는 임시 배치가 현실적 대안`);
  }

  const period =
    score >= 60
      ? "즉시~1개월 내 실행 가능"
      : score >= 45
      ? "3~6개월 육성 후 전환"
      : "6개월 이상 준비 기간 필요";

  return { headline, details, period };
}

// ── 컴포넌트 ────────────────────────────────────────────────

export function SimulatorClient() {
  const matrix = useAppStore((s) => s.matrix);

  // 포스트 목록: current + wings 중 taskKey 있는 것만
  const postOptions = useMemo(() => {
    const list: { label: string; taskKey: string; area: string; color: PostColor; person: string }[] = [];
    matrix.forEach((row) => {
      if (row.current.taskKey) {
        list.push({
          label: row.current.title ?? row.current.taskKey,
          taskKey: row.current.taskKey,
          area: row.area,
          color: row.current.color,
          person: row.current.person ?? "",
        });
      }
      row.wings.forEach((w) => {
        if (w.taskKey && w.color !== "empty") {
          list.push({
            label: w.title ?? w.taskKey,
            taskKey: w.taskKey,
            area: row.area,
            color: w.color,
            person: w.person ?? "",
          });
        }
      });
    });
    return list;
  }, [matrix]);

  const [selectedPostKey, setSelectedPostKey] = useState<string | null>(
    postOptions[0]?.taskKey ?? null
  );
  const [selectedCandId, setSelectedCandId] = useState<string | null>(null);

  const selectedPost = postOptions.find((p) => p.taskKey === selectedPostKey) ?? null;
  const prof = useMemo(
    () => resolveTaskProfile(selectedPostKey ?? undefined),
    [selectedPostKey]
  );

  const incumbentName = selectedPost ? personName(selectedPost.person) : undefined;

  const ranked = useMemo<ScoredCandidate[]>(
    () =>
      selectedPost
        ? rankCandidates(prof, SAMPLE_EMPLOYEES, {
            limit: 5,
            excludeName: incumbentName && incumbentName !== "-" ? incumbentName : undefined,
          })
        : [],
    [selectedPost, prof, incumbentName]
  );

  const selected = ranked.find((r) => r.id === selectedCandId) ?? ranked[0] ?? null;

  const beforeRisk: RiskLevel = selectedPost ? colorToRisk(selectedPost.color) : "MEDIUM";
  const afterRisk: RiskLevel = selected ? scoreToRisk(selected.match.totalScore) : beforeRisk;

  const impact = useMemo(() => {
    if (!selectedPost || !selected) return null;
    return buildImpact(
      selectedPost.area,
      selectedPost.label,
      beforeRisk,
      afterRisk,
      selected.name,
      selected.match.totalScore
    );
  }, [selectedPost, selected, beforeRisk, afterRisk]);

  return (
    <>
      <PageHeader
        title="인재 교체 시뮬레이터"
        subtitle="포스트에 후보를 배치했을 때 조직 리스크와 비즈니스 영향 변화를 미리 확인합니다. (v4.0 Preview)"
        actions={
          <span className="chip bg-brand-50 text-brand-700 text-[12px] font-semibold px-3 py-1.5">
            <IconSimulator className="h-3.5 w-3.5 inline mr-1" />
            시뮬레이션 전용 — 실제 발령 아님
          </span>
        }
      />

      <div className="grid grid-cols-[280px_1fr] gap-0 overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
        {/* ── 포스트 선택 리스트 ── */}
        <div className="border-r border-line bg-surface overflow-y-auto">
          <div className="px-4 py-3 border-b border-line">
            <div className="text-[12px] font-bold text-ink-900">포스트 선택</div>
            <div className="text-[11px] text-ink-400 mt-0.5">교체를 시뮬레이션할 포스트를 고르세요</div>
          </div>
          <ul className="p-2 space-y-1">
            {postOptions.map((p) => {
              const active = p.taskKey === selectedPostKey;
              const riskLevel = colorToRisk(p.color);
              const tone = RISK_TONE[riskLevel];
              return (
                <li key={`${p.taskKey}-${p.person}`}>
                  <button
                    onClick={() => {
                      setSelectedPostKey(p.taskKey);
                      setSelectedCandId(null);
                    }}
                    className={cn(
                      "w-full text-left rounded-xl px-3 py-2.5 transition border",
                      active
                        ? "border-brand-200 bg-brand-50"
                        : "border-transparent hover:bg-canvas"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-semibold text-ink-900 truncate">
                          {p.label}
                        </div>
                        <div className="text-[11px] text-ink-400 mt-0.5">
                          {p.area} · {personName(p.person) || "공석"}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                          tone.bg,
                          tone.color
                        )}
                      >
                        {tone.label}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── 메인 시뮬레이션 영역 ── */}
        <div className="overflow-y-auto">
          {selectedPost ? (
            <div className="p-6 space-y-5">
              {/* 포스트 헤더 */}
              <div className="card p-5">
                <div className="text-[11px] font-bold text-ink-400 uppercase tracking-wide mb-1.5">
                  시뮬레이션 대상 포스트
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[20px] font-bold text-ink-900">
                      {selectedPost.label}
                    </div>
                    <div className="text-[13px] text-ink-500 mt-0.5">
                      {selectedPost.area} · 현직자: {personName(selectedPost.person) || "공석"}
                    </div>
                    <div className="text-[12px] text-ink-400 mt-0.5">{prof.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-ink-400 mb-1">현재 리스크</div>
                    <span
                      className={cn(
                        "rounded-xl px-3 py-1.5 text-[13px] font-bold",
                        RISK_TONE[beforeRisk].bg,
                        RISK_TONE[beforeRisk].color
                      )}
                    >
                      {RISK_TONE[beforeRisk].label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[260px_1fr] gap-5">
                {/* 추천 후보 리스트 */}
                <div className="card overflow-hidden">
                  <div className="px-4 py-3 border-b border-line bg-canvas">
                    <div className="text-[12px] font-bold text-ink-900">
                      내부 추천 후보 {ranked.length}명
                    </div>
                  </div>
                  <ul className="p-2 space-y-1.5">
                    {ranked.map((c, i) => {
                      const riskAfter = scoreToRisk(c.match.totalScore);
                      const isSelected = selected?.id === c.id;
                      return (
                        <li key={c.id}>
                          <button
                            onClick={() => setSelectedCandId(c.id)}
                            className={cn(
                              "w-full text-left flex items-center gap-3 rounded-xl border px-3 py-2.5 transition",
                              isSelected
                                ? "border-brand-200 bg-brand-50"
                                : "border-transparent hover:bg-canvas"
                            )}
                          >
                            <span className="text-[12px] font-bold text-ink-300 w-4 text-center">
                              {i + 1}
                            </span>
                            <ScoreRing
                              value={c.match.totalScore}
                              size={36}
                              stroke={4}
                              color={RISK_TONE[riskAfter].hex}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-bold text-ink-900 truncate">
                                {c.name}
                              </div>
                              <div className="text-[11px] text-ink-400">
                                {c.grade} · {c.orgName}
                              </div>
                            </div>
                            <span
                              className={cn(
                                "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                                RISK_TONE[riskAfter].bg,
                                RISK_TONE[riskAfter].color
                              )}
                            >
                              {RISK_TONE[riskAfter].label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* 시뮬레이션 결과 */}
                {selected && impact && (
                  <div className="space-y-4">
                    {/* 리스크 변화 Before → After */}
                    <div className="card p-5">
                      <div className="text-[13px] font-bold text-ink-900 mb-4">
                        리스크 변화 시뮬레이션
                      </div>
                      <div className="flex items-center gap-4">
                        <RiskBox level={beforeRisk} label="현재 (교체 전)" />
                        <IconArrowRight className="h-6 w-6 text-ink-300 shrink-0" />
                        <RiskBox level={afterRisk} label={`${selected.name} 배치 후`} />

                        <div className="flex-1 ml-2">
                          <div
                            className={cn(
                              "rounded-xl px-4 py-3",
                              afterRisk !== beforeRisk
                                ? RISK_SCORE[afterRisk] > RISK_SCORE[beforeRisk]
                                  ? "bg-signal-greenBg"
                                  : "bg-signal-redBg"
                                : "bg-canvas"
                            )}
                          >
                            <div className="text-[12px] font-bold text-ink-700 mb-1">
                              {impact.headline}
                            </div>
                            <div className="text-[11px] text-ink-500">
                              {impact.period}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 후보 스코어 상세 */}
                    <div className="card p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <ScoreRing
                          value={selected.match.totalScore}
                          size={60}
                          stroke={6}
                          color={RISK_TONE[afterRisk].hex}
                          label="종합"
                        />
                        <div>
                          <div className="text-[16px] font-bold text-ink-900">
                            {selected.name}
                          </div>
                          <div className="text-[12.5px] text-ink-500">
                            {selected.grade} · {selected.orgName} · {selected.disc}형
                          </div>
                          <div className="mt-1">
                            <span
                              className={cn(
                                "chip text-[11px]",
                                afterRisk === "LOW"
                                  ? "bg-signal-greenBg text-signal-green"
                                  : afterRisk === "MEDIUM"
                                  ? "bg-signal-amberBg text-signal-amber"
                                  : "bg-signal-redBg text-signal-red"
                              )}
                            >
                              {selected.match.verdict}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 스코어 바 */}
                      <div className="space-y-2">
                        {[
                          { label: "앵커 유사도", v: selected.match.anchorSimilarity, w: "25%" },
                          { label: "포스트 부합", v: selected.match.postFit, w: "20%" },
                          { label: "핵심역량", v: selected.match.capability, w: "20%" },
                          { label: "DISC 적합", v: selected.match.discFit, w: "13%" },
                          { label: "강점 매칭", v: selected.match.strengthFit, w: "12%" },
                          { label: "즉시성", v: selected.match.readiness, w: "10%" },
                        ].map(({ label, v, w }) => (
                          <div key={label}>
                            <div className="flex justify-between text-[11.5px] mb-0.5">
                              <span className="text-ink-500">
                                {label}
                                <span className="text-ink-300 ml-1">{w}</span>
                              </span>
                              <span className="font-semibold text-ink-900">{v}</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                              <div
                                className="h-full rounded-full bg-brand-600"
                                style={{ width: `${Math.max(0, Math.min(100, v))}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 비즈니스 영향 상세 */}
                    <div className="card p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <IconBarChart className="h-4 w-4 text-brand-700" />
                        <div className="text-[13px] font-bold text-ink-900">
                          비즈니스 영향 분석
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {impact.details.map((d, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-[12.5px] text-ink-700"
                          >
                            {afterRisk === "HIGH" ? (
                              <IconWarn className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-amber" />
                            ) : (
                              <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" />
                            )}
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-ink-400 text-[14px]">
              왼쪽에서 포스트를 선택하세요
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function RiskBox({ level, label }: { level: RiskLevel; label: string }) {
  const tone = RISK_TONE[level];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="text-[10.5px] text-ink-400 font-semibold">{label}</div>
      <div
        className={cn(
          "rounded-2xl px-5 py-3 text-[16px] font-bold min-w-[80px] text-center",
          tone.bg,
          tone.color
        )}
      >
        {tone.label}
      </div>
    </div>
  );
}
