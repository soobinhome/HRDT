"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/shell/PageHeader";
import { UploadModal } from "./UploadModal";
import { ExternalDetail } from "./ExternalDetail";
import { CandidateExternal, ExternalStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScoreRing } from "@/components/ui/dataviz";
import {
  IconUpload,
  IconSearch,
  IconBuilding,
  IconInbox,
} from "@/components/ui/icons";

const STATUSES: ExternalStatus[] = [
  "1차검토",
  "심층면접",
  "최종후보",
  "채용결정",
  "보류",
];

const STATUS_TONE: Record<ExternalStatus, { chip: string; dot: string }> = {
  "1차검토": { chip: "bg-canvas text-ink-500", dot: "bg-ink-300" },
  심층면접: { chip: "bg-signal-blueBg text-signal-blue", dot: "bg-signal-blue" },
  최종후보: {
    chip: "bg-signal-amberBg text-signal-amber",
    dot: "bg-signal-amber",
  },
  채용결정: {
    chip: "bg-signal-greenBg text-signal-green",
    dot: "bg-signal-green",
  },
  보류: { chip: "bg-canvas text-ink-400", dot: "bg-ink-300" },
};

function fitColor(v: number) {
  if (v >= 78) return "#1B9E6B";
  if (v >= 62) return "#D9920A";
  return "#878E9C";
}

export function ExternalClient() {
  const externals = useAppStore((s) => s.externals);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ExternalStatus | "all">("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    STATUSES.forEach((s) => (c[s] = 0));
    externals.forEach((e) => (c[e.status] = (c[e.status] ?? 0) + 1));
    return c;
  }, [externals]);

  const view = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return externals.filter((e) => {
      const okS = filter === "all" || e.status === filter;
      const hay = [e.name, e.company, e.jobField, ...e.parsedSkills]
        .join(" ")
        .toLowerCase();
      const okQ = !ql || hay.includes(ql);
      return okS && okQ;
    });
  }, [externals, q, filter]);

  const detail = externals.find((e) => e.id === detailId) ?? null;

  return (
    <>
      <PageHeader
        title="외부 인재 파이프라인"
        subtitle="외부 후보 이력서를 AI로 분석하고 포스트 적합도·비즈니스 시나리오를 검토합니다."
        actions={
          <button onClick={() => setUploadOpen(true)} className="btn-primary">
            <IconUpload className="h-4 w-4" />
            이력서 업로드
          </button>
        }
      />

      <div className="space-y-5 px-8 py-6">
        {/* 파이프라인 퍼널 */}
        <div className="grid grid-cols-5 gap-3">
          {STATUSES.map((s) => {
            const active = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(active ? "all" : s)}
                className={cn(
                  "card flex flex-col gap-1.5 p-4 text-left transition",
                  active && "ring-2 ring-brand-200"
                )}
              >
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-500">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      STATUS_TONE[s].dot
                    )}
                  />
                  {s}
                </div>
                <div className="text-[24px] font-bold tracking-tight text-ink-900">
                  {counts[s] ?? 0}
                </div>
              </button>
            );
          })}
        </div>

        {/* 툴바 */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-[320px]">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="이름·회사·직무·스킬 검색"
              className="input pl-9"
            />
          </div>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="btn-ghost text-[12.5px]"
            >
              필터 해제 · 전체 보기
            </button>
          )}
        </div>

        {/* 후보 카드 그리드 */}
        {view.length ? (
          <div className="grid grid-cols-3 gap-3">
            {view.map((c) => (
              <ExternalCard
                key={c.id}
                cand={c}
                onClick={() => setDetailId(c.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-ink-400">
              <IconInbox className="h-6 w-6" />
            </div>
            <div className="text-[14px] font-semibold text-ink-700">
              {q || filter !== "all"
                ? "조건에 맞는 후보가 없습니다"
                : "아직 등록된 외부 후보가 없습니다"}
            </div>
            <button onClick={() => setUploadOpen(true)} className="btn-subtle">
              <IconUpload className="h-4 w-4" /> 이력서 업로드로 시작
            </button>
          </div>
        )}

        <p className="text-center text-[11.5px] text-ink-400">
          업로드된 이력서 원문은 파싱 후 보관하지 않습니다(시연 기준). 모든 매칭
          결과는 참고·검토용입니다.
        </p>
      </div>

      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
      <ExternalDetail candidate={detail} onClose={() => setDetailId(null)} />
    </>
  );
}

function ExternalCard({
  cand,
  onClick,
}: {
  cand: CandidateExternal;
  onClick: () => void;
}) {
  const fit = cand.fitScore ?? 0;
  return (
    <button
      onClick={onClick}
      className="card flex flex-col gap-3 p-4 text-left transition hover:shadow-pop"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-bold text-ink-900">
              {cand.name}
            </span>
            <span className={cn("chip", STATUS_TONE[cand.status].chip)}>
              {cand.status}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-500">
            <IconBuilding className="h-3.5 w-3.5 text-ink-400" />
            <span className="truncate">{cand.company}</span>
          </div>
          <div className="text-[11.5px] text-ink-400">{cand.grade}</div>
        </div>
        <ScoreRing value={fit} size={48} stroke={5} color={fitColor(fit)} />
      </div>

      {cand.assignedTaskKey && (
        <div className="rounded-lg bg-canvas px-2.5 py-1.5 text-[11.5px]">
          <span className="text-ink-400">검토 포스트 · </span>
          <span className="font-semibold text-ink-700">
            {cand.assignedTaskKey}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {cand.parsedSkills.slice(0, 4).map((s) => (
          <span
            key={s}
            className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-medium text-brand-700"
          >
            {s}
          </span>
        ))}
      </div>
    </button>
  );
}
