"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  IconGrid,
  IconInbox,
  IconUsers,
  IconShield,
  IconBarChart,
  IconSimulator,
  IconBuilding,
  IconStar,
} from "@/components/ui/icons";

const NAV = [
  { href: "/", label: "핵심 포스트 노출판", icon: IconGrid, desc: "핵심 포스트 현황", badge: null },
  {
    href: "/external",
    label: "외부 인재 파이프라인",
    icon: IconInbox,
    desc: "PDF 업로드·AI 매칭",
    badge: null,
  },
  { href: "/talent", label: "내부 인재 풀", icon: IconUsers, desc: "직원 데이터", badge: null },
  {
    href: "/executive",
    label: "경영진 대시보드",
    icon: IconBarChart,
    desc: "조직 건강도·승계 준비율",
    badge: "v2.0",
  },
  {
    href: "/simulator",
    label: "인재 교체 시뮬레이터",
    icon: IconSimulator,
    desc: "교체 시 비즈니스 영향 예측",
    badge: "v3.0",
  },
  {
    href: "/b2b",
    label: "B2B SaaS 미리보기",
    icon: IconBuilding,
    desc: "외부 기업 도입 시나리오",
    badge: "v4.0",
  },
  {
    href: "/pricing",
    label: "요금제",
    icon: IconStar,
    desc: "버전별 가격·권한 플랜",
    badge: null,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[248px] flex-col border-r border-line bg-surface">
      <div className="flex items-center gap-2.5 px-5 pb-4 pt-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-sm font-bold text-white">
          HR
        </div>
        <div className="leading-tight">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[14px] font-bold tracking-tight text-ink-900">E-Allocator</span>
            <span className="text-[10px] font-medium text-ink-300">/</span>
            <span className="text-[14px] font-bold tracking-tight text-brand-600">E-Navigator</span>
          </div>
          <div className="text-[10.5px] font-medium text-ink-400">
            유통BG 인재 컨트롤타워
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pt-2">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
          운영
        </div>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-700 hover:bg-canvas"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0",
                      active ? "text-brand-700" : "text-ink-400"
                    )}
                  />
                  <span className="flex flex-col leading-tight min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[13.5px] font-semibold truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="shrink-0 rounded-md bg-brand-700 px-1 py-0.5 text-[9px] font-bold text-white leading-none">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-[11px]",
                        active ? "text-brand-500" : "text-ink-400"
                      )}
                    >
                      {item.desc}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 pb-5">
        <div className="flex items-start gap-2.5 rounded-xl border border-line bg-canvas px-3.5 py-3">
          <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-signal-blue" />
          <div className="leading-snug">
            <div className="text-[12px] font-semibold text-ink-700">
              시연 모드 · 샘플 데이터
            </div>
            <div className="mt-0.5 text-[11px] text-ink-400">
              실명·민감정보 미포함. 제안서 캡처 가능.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
