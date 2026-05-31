"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { cn } from "@/lib/utils";
import {
  IconBuilding,
  IconCheck,
  IconArrowRight,
  IconUsers,
  IconGrid,
  IconBarChart,
  IconSimulator,
  IconSpark,
} from "@/components/ui/icons";

// ── 샘플 고객사 ────────────────────────────────────────────
const CLIENTS = [
  {
    id: "shinsegae",
    name: "신세계그룹",
    industry: "유통·백화점",
    size: "임직원 30,000명+",
    logo: "신",
    color: "1E40AF",
    bg: "EEF3FF",
    posts: 12,
    redPosts: 5,
    successionRate: 28,
    challenge: "백화점·이마트 조직 분리 이후 핵심 임원 승계 공백 심화. CHRO가 전체 포스트 현황을 파악하는 데 월 2~3일 소요.",
    features: ["핵심 포스트 매트릭스", "AI 후보 추천", "외부 인재 파이프라인", "경영진 대시보드"],
    roi: "임원 공백 대응 시간 70% 단축",
  },
  {
    id: "lotte",
    name: "롯데쇼핑",
    industry: "유통·마트·홈쇼핑",
    size: "임직원 25,000명+",
    logo: "롯",
    color: "B91C1C",
    bg: "FEF2F2",
    posts: 9,
    redPosts: 4,
    successionRate: 33,
    challenge: "마트·백화점·홈쇼핑 복합 사업구조에서 인재 이동 시 적합도 판단 기준 부재. 발령 후 성과 저하 사례 반복.",
    features: ["핵심 포스트 매트릭스", "AI 후보 추천", "인재 교체 시뮬레이터", "경영진 대시보드"],
    roi: "발령 후 3개월 성과 저하율 40% 감소",
  },
  {
    id: "hyundai",
    name: "현대백화점그룹",
    industry: "백화점·면세·리빙",
    size: "임직원 15,000명+",
    logo: "현",
    color: "059669",
    bg: "ECFDF5",
    posts: 7,
    redPosts: 2,
    successionRate: 57,
    challenge: "면세·백화점 간 인재 이동 시 적합도 검증 체계 미비. 외부 채용 증가로 인한 내부 육성 모티베이션 저하.",
    features: ["내부 인재 풀", "외부 인재 파이프라인", "인재 교체 시뮬레이터", "요금제 맞춤 설정"],
    roi: "내부 승진율 25% 향상",
  },
];

const FEATURE_LIST = [
  { icon: IconGrid, label: "핵심 포스트 매트릭스", desc: "조직별 승계 현황 신호등 시각화" },
  { icon: IconUsers, label: "AI 후보 추천", desc: "scoreTalent V8.0 내부 인재 자동 랭킹" },
  { icon: IconBarChart, label: "경영진 대시보드", desc: "조직 건강도·승계 준비율 경영 보고" },
  { icon: IconSimulator, label: "인재 교체 시뮬레이터", desc: "교체 시 비즈니스 영향 사전 예측" },
  { icon: IconSpark, label: "외부 인재 파이프라인", desc: "이력서 AI 파싱·포스트 매칭·채용 시나리오" },
  { icon: IconBuilding, label: "멀티 테넌트 관리", desc: "법인·사업부별 독립 데이터 격리" },
];

export function B2BClient() {
  const [selected, setSelected] = useState<string>("shinsegae");
  const client = CLIENTS.find((c) => c.id === selected)!;

  return (
    <>
      <PageHeader
        title="B2B SaaS 미리보기"
        subtitle="외부 기업에 인재 컨트롤타워를 도입했을 때의 시나리오를 미리 확인합니다. (v4.0 Preview)"
        actions={
          <span className="chip bg-brand-50 text-brand-700 text-[12px] font-semibold px-3 py-1.5">
            <IconBuilding className="h-3.5 w-3.5 inline mr-1" />
            향후 외부 판매 예정 기능
          </span>
        }
      />

      <div className="px-8 py-6 space-y-6">

        {/* 안내 배너 */}
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 flex items-start gap-3">
          <IconSpark className="h-5 w-5 text-brand-700 mt-0.5 shrink-0" />
          <div>
            <div className="text-[13px] font-bold text-brand-700">v4.0 로드맵 — 외부 B2B SaaS 확장</div>
            <p className="text-[12px] text-brand-600 mt-0.5">
              이랜드 내부 검증(v1.0~v3.0) 완료 후, 동일 플랫폼을 타 유통 대기업에 멀티 테넌트 SaaS로 제공합니다.
              각 기업은 자사 조직구조와 인재 데이터를 독립적으로 관리하며, 동일한 AI 스코어링·시뮬레이션 기능을 사용합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[260px_1fr] gap-5">

          {/* 고객사 선택 */}
          <div className="space-y-3">
            <div className="text-[12px] font-bold text-ink-500 uppercase tracking-wide">도입 예시 기업</div>
            {CLIENTS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={cn(
                  "w-full text-left rounded-2xl border p-4 transition",
                  selected === c.id
                    ? "border-brand-200 bg-brand-50"
                    : "border-line bg-surface hover:bg-canvas"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-[15px] shrink-0"
                    style={{ backgroundColor: `#${c.color}` }}
                  >
                    {c.logo}
                  </div>
                  <div>
                    <div className="text-[13.5px] font-bold text-ink-900">{c.name}</div>
                    <div className="text-[11px] text-ink-400">{c.industry}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-md bg-signal-redBg px-2 py-0.5 text-[10.5px] font-bold text-signal-red">
                    위험 {c.redPosts}개
                  </span>
                  <span className="rounded-md bg-canvas px-2 py-0.5 text-[10.5px] text-ink-500">
                    승계준비 {c.successionRate}%
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* 고객사 상세 */}
          <div className="space-y-4">

            {/* 헤더 */}
            <div className="card p-5">
              <div className="flex items-center gap-4">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-[22px] shrink-0"
                  style={{ backgroundColor: `#${client.color}` }}
                >
                  {client.logo}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-bold text-ink-900">{client.name}</h2>
                    <span className="chip bg-canvas text-ink-500 text-[11px]">{client.industry}</span>
                  </div>
                  <div className="text-[12px] text-ink-400 mt-0.5">{client.size}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-ink-400 mb-1">승계 준비율</div>
                  <div className="text-[28px] font-bold" style={{ color: `#${client.color}` }}>
                    {client.successionRate}%
                  </div>
                </div>
              </div>
            </div>

            {/* 도입 배경 */}
            <div className="card p-5">
              <div className="text-[13px] font-bold text-ink-900 mb-2">도입 배경 · 현재 과제</div>
              <p className="text-[12.5px] text-ink-700 leading-relaxed">{client.challenge}</p>
            </div>

            {/* 제공 기능 */}
            <div className="card p-5">
              <div className="text-[13px] font-bold text-ink-900 mb-3">제공 기능 패키지</div>
              <div className="grid grid-cols-2 gap-2">
                {FEATURE_LIST.map((f) => {
                  const included = client.features.includes(f.label);
                  const Icon = f.icon;
                  return (
                    <div
                      key={f.label}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 border",
                        included
                          ? "border-signal-greenBg bg-signal-greenBg"
                          : "border-line bg-canvas opacity-50"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", included ? "text-signal-green" : "text-ink-300")} />
                      <div className="min-w-0">
                        <div className={cn("text-[12px] font-semibold", included ? "text-ink-900" : "text-ink-400")}>
                          {f.label}
                        </div>
                        <div className="text-[10.5px] text-ink-400 truncate">{f.desc}</div>
                      </div>
                      {included && <IconCheck className="h-3.5 w-3.5 text-signal-green shrink-0 ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 기대 ROI */}
            <div className="rounded-2xl border border-signal-greenBg bg-signal-greenBg px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-signal-green uppercase tracking-wide">기대 ROI</div>
                <div className="text-[15px] font-bold text-ink-900 mt-0.5">{client.roi}</div>
              </div>
              <button className="flex items-center gap-1.5 rounded-xl bg-signal-green px-4 py-2 text-[12px] font-bold text-white">
                도입 문의 <IconArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* 멀티 테넌트 구조 안내 */}
        <div className="card p-5">
          <div className="text-[13px] font-bold text-ink-900 mb-4">멀티 테넌트 아키텍처 — 기업별 완전 격리</div>
          <div className="grid grid-cols-3 gap-3">
            {CLIENTS.map((c) => (
              <div key={c.id} className="rounded-xl border border-line p-4" style={{ borderColor: `#${c.color}20` }}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-white font-bold text-[11px]"
                    style={{ backgroundColor: `#${c.color}` }}
                  >
                    {c.logo}
                  </div>
                  <span className="text-[12px] font-bold text-ink-900">{c.name}</span>
                </div>
                <div className="space-y-1.5">
                  {["조직 데이터 격리", "독립 권한 관리", "전용 대시보드", "개별 요금 청구"].map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-[11px] text-ink-600">
                      <IconCheck className="h-3 w-3 text-signal-green shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-ink-400">
          본 페이지는 v4.0 로드맵 시연용입니다. 실제 기업 데이터가 아닌 가상 시나리오입니다.
        </p>
      </div>
    </>
  );
}
