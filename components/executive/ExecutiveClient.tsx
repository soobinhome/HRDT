"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/shell/PageHeader";
import { PostRow, PostColor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconWarn, IconCheck, IconBarChart, IconBolt } from "@/components/ui/icons";

// ── 조직 건강도 계산 ──────────────────────────────────────

interface OrgStat {
  area: string;
  level?: string;
  healthScore: number; // 0-100
  successionReady: boolean; // F2/F3 중 yellow 이상 존재
  currentRisk: PostColor;
  redCount: number;
  totalFilled: number;
  tag: string; // 핵심 과업 태그
}

function computeOrgStats(matrix: PostRow[]): OrgStat[] {
  return matrix.map((row) => {
    const allCells = [row.current, ...row.successors, ...row.wings];
    const filled = allCells.filter(
      (c) => c.color !== "empty" && (c.title || c.person)
    );
    const redCount = filled.filter((c) => c.color === "red").length;
    const nonRed = filled.length > 0 ? (filled.length - redCount) / filled.length : 0;
    const healthScore = Math.round(nonRed * 100);
    const successionReady = row.successors.some(
      (s) => s.color === "blue" || s.color === "yellow" || s.color === "green"
    );
    return {
      area: row.area,
      level: row.level,
      healthScore,
      successionReady,
      currentRisk: row.current.color,
      redCount,
      totalFilled: filled.length,
      tag: row.current.title ?? "",
    };
  });
}

function healthBand(score: number): { label: string; color: string; bg: string } {
  if (score >= 75) return { label: "안정", color: "text-signal-green", bg: "bg-signal-greenBg" };
  if (score >= 50) return { label: "주의", color: "text-signal-amber", bg: "bg-signal-amberBg" };
  return { label: "위험", color: "text-signal-red", bg: "bg-signal-redBg" };
}

// ── 페르소나 인사이트 (가상 CHO 관점 코멘트) ───────────────
const EXEC_INSIGHTS = [
  {
    persona: "지주 CHO",
    insight: "승계 공백이 집중된 BG 총괄·재무 포스트는 12개월 내 교체 리스크가 현실화될 수 있습니다. F2 후보군을 즉시 지정하고 육성 로드맵 착수가 필요합니다.",
    action: "F2 지정 및 EBG 트랙 배치",
  },
  {
    persona: "유통BG 인사실장",
    insight: "AI·온라인 조직에 즉시 투입 가능한 내부 후보가 부족합니다. 외부 채용과 내부 육성을 병행하는 이중 트랙 전략이 필요합니다.",
    action: "외부 후보 파이프라인 가동",
  },
  {
    persona: "의류사업부 HRBP",
    insight: "의류 조직 내 5개 포스트 중 3개가 공석/빨간불입니다. 핵심 상품 포트폴리오 실행력에 직접 영향을 미칩니다.",
    action: "의류 포스트 즉시 임시 배치 검토",
  },
];

// ── 비즈니스 영향도 맵핑 ──────────────────────────────────
const BUSINESS_IMPACT: Record<string, string> = {
  유통BG: "BG 총괄 공백 → 전사 전략 방향성 흔들림, M&A·투자 결정 지연",
  HO: "인사 총괄 공백 → A인재 확보 속도 저하, 조직문화 리스크 확대",
  FO: "재무 총괄 공백 → 손익 모니터링 공백, 리스크 헷징 불가",
  SO: "전략 총괄 공백 → KPI 측정·보고 체계 마비, 경영 의사결정 지연",
  의류: "상품 총괄 공백 → 시즌 MD 계획 차질, 재고·수익 악화",
  특정: "특정 총괄 공백 → 콘텐츠 경쟁력 저하, 고객 이탈 가속",
  OPR: "OPR 총괄 공백 → 공급망 불안정, 물류비 증가",
  온라인: "온라인 총괄 공백 → O2O 전환 지연, 디지털 매출 감소",
  AI: "AI 총괄 공백 → 전 직무 AI 전환 프로젝트 중단, 경쟁 열위",
};

export function ExecutiveClient() {
  const matrix = useAppStore((s) => s.matrix);

  const stats = useMemo(() => computeOrgStats(matrix), [matrix]);

  const overallHealth = useMemo(() => {
    const avg = stats.reduce((s, o) => s + o.healthScore, 0) / stats.length;
    return Math.round(avg);
  }, [stats]);

  const successionRate = useMemo(() => {
    const ready = stats.filter((s) => s.successionReady).length;
    return Math.round((ready / stats.length) * 100);
  }, [stats]);

  const immediateRisks = useMemo(
    () => stats.filter((s) => s.currentRisk === "red").length,
    [stats]
  );

  const totalRedCells = useMemo(
    () => stats.reduce((s, o) => s + o.redCount, 0),
    [stats]
  );

  const healthBandOverall = healthBand(overallHealth);

  return (
    <>
      <PageHeader
        title="경영진 대시보드"
        subtitle="조직 전체 인재 리스크와 승계 준비도를 경영 언어로 요약합니다. (v2.0 Preview)"
        actions={
          <span className="chip bg-brand-50 text-brand-700 text-[12px] font-semibold px-3 py-1.5">
            <IconBarChart className="h-3.5 w-3.5 inline mr-1" />
            CHO · 인사실장 전용
          </span>
        }
      />

      <div className="space-y-6 px-8 py-6">
        {/* ── 핵심 지표 4개 ── */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            label="조직 건강도"
            value={`${overallHealth}점`}
            sub="빨간불 포스트 제외 비율"
            tone={healthBandOverall.color}
            bg={healthBandOverall.bg}
            badge={healthBandOverall.label}
          />
          <MetricCard
            label="승계 준비율"
            value={`${successionRate}%`}
            sub={`${stats.filter((s) => s.successionReady).length}개 조직 후계자 지정됨`}
            tone={successionRate >= 60 ? "text-signal-green" : "text-signal-amber"}
            bg={successionRate >= 60 ? "bg-signal-greenBg" : "bg-signal-amberBg"}
            badge={successionRate >= 60 ? "양호" : "보강 필요"}
          />
          <MetricCard
            label="즉시 리스크 조직"
            value={`${immediateRisks}개`}
            sub="현직자 빨간불 조직 수"
            tone="text-signal-red"
            bg="bg-signal-redBg"
            badge="즉시 대응"
          />
          <MetricCard
            label="전체 공백/위험 포스트"
            value={`${totalRedCells}개`}
            sub="매트릭스 내 빨간불 셀 합계"
            tone="text-signal-amber"
            bg="bg-signal-amberBg"
            badge="모니터링"
          />
        </div>

        <div className="grid grid-cols-[1fr_360px] gap-5">
          {/* ── 조직별 리스크 테이블 ── */}
          <div className="card overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <div className="text-[14px] font-bold text-ink-900">
                조직별 리스크 현황
              </div>
              <div className="text-[12px] text-ink-500 mt-0.5">
                현직자 리스크 · 승계 준비도 · 비즈니스 영향
              </div>
            </div>
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="bg-canvas text-ink-400 text-[11px] font-semibold uppercase tracking-wide">
                  <th className="py-2.5 pl-5 text-left">조직</th>
                  <th className="py-2.5 text-left">핵심 포스트</th>
                  <th className="py-2.5 text-center">건강도</th>
                  <th className="py-2.5 text-center">승계</th>
                  <th className="py-2.5 pr-5 text-left">비즈니스 영향</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((org) => {
                  const band = healthBand(org.healthScore);
                  return (
                    <tr
                      key={org.area}
                      className="border-t border-line hover:bg-canvas transition"
                    >
                      <td className="py-3 pl-5">
                        <div className="font-bold text-ink-900">{org.area}</div>
                        {org.level && (
                          <div className="text-[10.5px] text-ink-400">{org.level}</div>
                        )}
                      </td>
                      <td className="py-3 max-w-[160px]">
                        <span className="truncate text-ink-700 block">{org.tag}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold",
                            band.bg,
                            band.color
                          )}
                        >
                          {org.healthScore}점 · {band.label}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {org.successionReady ? (
                          <IconCheck className="h-4 w-4 text-signal-green mx-auto" />
                        ) : (
                          <IconWarn className="h-4 w-4 text-signal-red mx-auto" />
                        )}
                      </td>
                      <td className="py-3 pr-5">
                        <span className="text-[11.5px] text-ink-500 leading-snug">
                          {BUSINESS_IMPACT[org.area] ?? "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── 경영진 인사이트 패널 ── */}
          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <IconBolt className="h-4 w-4 text-brand-700" />
                <div className="text-[13px] font-bold text-ink-900">
                  페르소나 인사이트
                </div>
              </div>
              <div className="text-[11px] text-ink-400 mb-3">
                가상 CHO·HRBP 관점에서 도출된 핵심 액션 시그널
              </div>
              <div className="space-y-3">
                {EXEC_INSIGHTS.map((ins, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-line bg-canvas p-3"
                  >
                    <div className="text-[11px] font-bold text-brand-700 mb-1">
                      {ins.persona}
                    </div>
                    <p className="text-[12px] text-ink-700 leading-snug mb-2">
                      {ins.insight}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-signal-green">
                      <IconCheck className="h-3 w-3" />
                      {ins.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* v2.0 → v4.0 예고 배너 */}
            <div className="card p-4 border-brand-200 bg-brand-50">
              <div className="text-[12px] font-bold text-brand-700 mb-1.5">
                v4.0 로드맵 — 인재 교체 시뮬레이터
              </div>
              <p className="text-[11.5px] text-brand-600 leading-snug">
                특정 포스트에 후보를 교체했을 때 조직 건강도·비즈니스 영향이
                어떻게 바뀌는지 시뮬레이션합니다.
              </p>
              <a
                href="/simulator"
                className="mt-2.5 flex items-center gap-1.5 text-[12px] font-bold text-brand-700 hover:underline"
              >
                시뮬레이터 체험하기 →
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-ink-400">
          본 대시보드는 샘플 데이터 기반 시연용입니다. 실제 인사 결정에는 공식 HR 프로세스를 따릅니다.
        </p>
      </div>
    </>
  );
}

function MetricCard({
  label,
  value,
  sub,
  tone,
  bg,
  badge,
}: {
  label: string;
  value: string;
  sub: string;
  tone: string;
  bg: string;
  badge: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="text-[12px] font-semibold text-ink-500">{label}</div>
        <span
          className={cn(
            "rounded-lg px-2 py-0.5 text-[10.5px] font-bold",
            bg,
            tone
          )}
        >
          {badge}
        </span>
      </div>
      <div className={cn("text-[32px] font-bold tracking-tight", tone)}>
        {value}
      </div>
      <div className="mt-1 text-[11.5px] text-ink-400">{sub}</div>
    </div>
  );
}
