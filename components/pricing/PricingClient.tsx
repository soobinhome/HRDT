"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { cn } from "@/lib/utils";
import { IconCheck, IconWarn, IconArrowRight, IconStar } from "@/components/ui/icons";

const PLANS = [
  {
    version: "v1.0",
    name: "Starter",
    target: "법인 CHRO · HRBP",
    price: "문의",
    priceNote: "내부 도입 협의",
    color: "1E40AF",
    bg: "EEF3FF",
    highlight: false,
    desc: "이랜드 내부 법인 단위 도입. 핵심 포스트 관리와 인재 프로파일링 기본 기능.",
    features: [
      { label: "핵심 포스트 노출판", included: true },
      { label: "내부 인재 풀 (최대 200명)", included: true },
      { label: "외부 인재 파이프라인", included: true },
      { label: "AI 후보 추천 (scoreTalent V8.0)", included: true },
      { label: "엑셀 업로드·다운로드", included: true },
      { label: "경영진 대시보드", included: false },
      { label: "인재 교체 시뮬레이터", included: false },
      { label: "멀티 테넌트 (타 법인)", included: false },
      { label: "API 연동 (ERP·HCM)", included: false },
      { label: "전담 컨설팅", included: false },
    ],
    cta: "내부 도입 문의",
  },
  {
    version: "v2.0",
    name: "Professional",
    target: "그룹 CHO · 인사실장",
    price: "월 300만원~",
    priceNote: "조직 규모별 협의",
    color: "059669",
    bg: "ECFDF5",
    highlight: true,
    desc: "경영진 보고까지 커버하는 완성형 플랜. 조직 건강도·승계 준비율을 경영 언어로 제공.",
    features: [
      { label: "핵심 포스트 노출판", included: true },
      { label: "내부 인재 풀 (무제한)", included: true },
      { label: "외부 인재 파이프라인", included: true },
      { label: "AI 후보 추천 (scoreTalent V8.0)", included: true },
      { label: "엑셀 업로드·다운로드", included: true },
      { label: "경영진 대시보드", included: true },
      { label: "인재 교체 시뮬레이터", included: true },
      { label: "멀티 테넌트 (타 법인)", included: false },
      { label: "API 연동 (ERP·HCM)", included: false },
      { label: "전담 컨설팅", included: false },
    ],
    cta: "도입 상담 신청",
  },
  {
    version: "v3.0",
    name: "Enterprise",
    target: "대기업 경영진 · 이사회",
    price: "연 1억원~",
    priceNote: "맞춤 계약",
    color: "7C3AED",
    bg: "F5F3FF",
    highlight: false,
    desc: "인재-비즈니스 시뮬레이션까지 포함한 최고 수준 플랜. 전담 컨설팅과 ERP 연동 제공.",
    features: [
      { label: "핵심 포스트 노출판", included: true },
      { label: "내부 인재 풀 (무제한)", included: true },
      { label: "외부 인재 파이프라인", included: true },
      { label: "AI 후보 추천 (scoreTalent V8.0)", included: true },
      { label: "엑셀 업로드·다운로드", included: true },
      { label: "경영진 대시보드", included: true },
      { label: "인재 교체 시뮬레이터", included: true },
      { label: "멀티 테넌트 (타 법인)", included: true },
      { label: "API 연동 (ERP·HCM)", included: true },
      { label: "전담 컨설팅", included: true },
    ],
    cta: "엔터프라이즈 문의",
  },
  {
    version: "v4.0",
    name: "B2B SaaS",
    target: "외부 기업 HR팀",
    price: "월 300만~1,000만원",
    priceNote: "임직원 규모별",
    color: "B45309",
    bg: "FFFBEB",
    highlight: false,
    desc: "외부 기업이 자사 조직·인재 데이터로 독립 운영하는 SaaS. 멀티 테넌트 완전 격리.",
    features: [
      { label: "핵심 포스트 노출판", included: true },
      { label: "내부 인재 풀 (무제한)", included: true },
      { label: "외부 인재 파이프라인", included: true },
      { label: "AI 후보 추천 (scoreTalent V8.0)", included: true },
      { label: "엑셀 업로드·다운로드", included: true },
      { label: "경영진 대시보드", included: true },
      { label: "인재 교체 시뮬레이터", included: true },
      { label: "멀티 테넌트 (독립 운영)", included: true },
      { label: "API 연동 (ERP·HCM)", included: true },
      { label: "전담 컨설팅 (온보딩)", included: true },
    ],
    cta: "파트너십 문의",
  },
];

export function PricingClient() {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = PLANS.find((p) => p.version === selected);

  return (
    <>
      <PageHeader
        title="요금제"
        subtitle="도입 목적과 규모에 맞는 플랜을 선택하세요. 카드를 클릭하면 상세 권한을 확인할 수 있습니다."
        actions={
          <span className="chip bg-signal-amberBg text-signal-amber text-[12px] font-semibold px-3 py-1.5">
            <IconStar className="h-3.5 w-3.5 inline mr-1" />
            모든 요금제 무료 체험 가능
          </span>
        }
      />

      <div className="px-8 py-6 space-y-6">

        {/* 플랜 카드 4개 */}
        <div className="grid grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <button
              key={plan.version}
              onClick={() => setSelected(selected === plan.version ? null : plan.version)}
              className={cn(
                "text-left rounded-2xl border p-5 transition-all",
                plan.highlight && "ring-2 ring-offset-1",
                selected === plan.version
                  ? "shadow-pop border-transparent"
                  : "border-line hover:border-brand-200 hover:shadow-card",
              )}
              style={selected === plan.version ? {
                backgroundColor: `#${plan.bg.replace("bg-", "")}`,
                borderColor: `#${plan.color}40`,
              } : {}}
            >
              {/* 버전 배지 */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="rounded-lg px-2 py-0.5 text-[10.5px] font-bold text-white"
                  style={{ backgroundColor: `#${plan.color}` }}
                >
                  {plan.version}
                </span>
                {plan.highlight && (
                  <span className="rounded-lg bg-signal-greenBg px-2 py-0.5 text-[10px] font-bold text-signal-green">
                    추천
                  </span>
                )}
              </div>

              <div className="text-[18px] font-bold text-ink-900">{plan.name}</div>
              <div className="text-[11px] text-ink-400 mt-0.5 mb-3">{plan.target}</div>

              <div className="text-[20px] font-bold" style={{ color: `#${plan.color}` }}>
                {plan.price}
              </div>
              <div className="text-[10.5px] text-ink-400 mt-0.5 mb-3">{plan.priceNote}</div>

              <p className="text-[11.5px] text-ink-600 leading-snug mb-4">{plan.desc}</p>

              <div
                className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold text-white"
                style={{ backgroundColor: `#${plan.color}` }}
              >
                {plan.cta} <IconArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>
          ))}
        </div>

        {/* 상세 권한 비교표 (클릭 시 펼쳐짐) */}
        {detail && (
          <div className="card overflow-hidden">
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{ backgroundColor: `#${detail.bg}` }}
            >
              <span
                className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-white"
                style={{ backgroundColor: `#${detail.color}` }}
              >
                {detail.version}
              </span>
              <div className="text-[14px] font-bold text-ink-900">{detail.name} — 상세 권한</div>
            </div>
            <div className="divide-y divide-line">
              {detail.features.map((f) => (
                <div key={f.label} className="flex items-center justify-between px-6 py-3">
                  <span className={cn("text-[13px]", f.included ? "text-ink-900" : "text-ink-300")}>
                    {f.label}
                  </span>
                  {f.included ? (
                    <IconCheck className="h-4 w-4 text-signal-green" />
                  ) : (
                    <IconWarn className="h-4 w-4 text-ink-200" />
                  )}
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-canvas flex justify-end">
              <button
                className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white"
                style={{ backgroundColor: `#${detail.color}` }}
              >
                {detail.cta} <IconArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* 전체 비교표 */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-line">
            <div className="text-[14px] font-bold text-ink-900">전체 기능 비교표</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-canvas">
                  <th className="py-3 pl-6 text-left text-ink-500 font-semibold w-[220px]">기능</th>
                  {PLANS.map((p) => (
                    <th key={p.version} className="py-3 px-4 text-center">
                      <div className="font-bold text-ink-900">{p.name}</div>
                      <div
                        className="text-[10px] font-bold mt-0.5"
                        style={{ color: `#${p.color}` }}
                      >
                        {p.version}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLANS[0].features.map((f, i) => (
                  <tr key={f.label} className={cn("border-t border-line", i % 2 === 0 && "bg-canvas/50")}>
                    <td className="py-2.5 pl-6 text-ink-700">{f.label}</td>
                    {PLANS.map((p) => (
                      <td key={p.version} className="py-2.5 px-4 text-center">
                        {p.features[i].included ? (
                          <IconCheck className="h-4 w-4 text-signal-green mx-auto" />
                        ) : (
                          <span className="text-ink-200 text-[16px]">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-[11px] text-ink-400">
          모든 요금제는 도입 규모·조직 구조에 따라 맞춤 협의 가능합니다. 문의: HO 인사기획팀
        </p>
      </div>
    </>
  );
}
