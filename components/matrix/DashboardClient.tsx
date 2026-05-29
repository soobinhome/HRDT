"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { computeKPI } from "@/lib/data/matrix";
import { PostColor, PostRow } from "@/lib/types";
import { KpiCards } from "./KpiCards";
import { CellRef, PostMatrix } from "./PostMatrix";
import { CellEditModal } from "./CellEditModal";
import { ExcelPanel } from "./ExcelPanel";
import { ScorerPanel } from "@/components/scorer/ScorerPanel";
import { PageHeader } from "@/components/shell/PageHeader";
import { cn } from "@/lib/utils";
import { IconEdit, IconSearch } from "@/components/ui/icons";

const FILTERS: { key: PostColor | "all"; label: string; dot?: string }[] = [
  { key: "all", label: "전체" },
  { key: "red", label: "빨간불", dot: "bg-signal-red" },
  { key: "yellow", label: "노란불", dot: "bg-signal-amber" },
  { key: "blue", label: "파란불", dot: "bg-signal-blue" },
];

function rowMatches(row: PostRow, q: string, color: PostColor | "all") {
  const cells = [row.current, ...row.successors, ...row.wings];
  const hay = [row.area, ...cells.flatMap((c) => [c.person, c.title])]
    .join(" ")
    .toLowerCase();
  const qok = !q || hay.includes(q.toLowerCase());
  const cok = color === "all" || cells.some((c) => c.color === color);
  return qok && cok;
}

export function DashboardClient() {
  const matrix = useAppStore((s) => s.matrix);
  const admin = useAppStore((s) => s.admin);
  const toggleAdmin = useAppStore((s) => s.toggleAdmin);

  const [q, setQ] = useState("");
  const [color, setColor] = useState<PostColor | "all">("all");
  const [scorerCell, setScorerCell] = useState<CellRef | null>(null);
  const [editCell, setEditCell] = useState<CellRef | null>(null);

  const kpi = useMemo(() => computeKPI(matrix), [matrix]);
  const view = useMemo(
    () => matrix.filter((r) => rowMatches(r, q, color)),
    [matrix, q, color]
  );

  const onCellClick = (ref: CellRef) => {
    if (admin) setEditCell(ref);
    else setScorerCell(ref);
  };

  return (
    <>
      <PageHeader
        title="핵심 포스트 노출판"
        subtitle="9개 조직 × 현직자·후계자·날개과업 현황. 셀을 클릭하면 내부 후보 판별기가 실행됩니다."
        actions={
          <button
            onClick={toggleAdmin}
            className={cn(admin ? "btn-primary" : "btn-ghost")}
          >
            <IconEdit className="h-4 w-4" />
            {admin ? "편집모드 ON" : "관리자 편집모드"}
          </button>
        }
      />

      <div className="space-y-5 px-8 py-6">
        <KpiCards kpi={kpi} />

        {/* 툴바 */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-[320px]">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="이름·과업·조직 검색"
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setColor(f.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12.5px] font-semibold transition",
                  color === f.key
                    ? "border-brand-200 bg-brand-50 text-brand-700"
                    : "border-line bg-surface text-ink-500 hover:bg-canvas"
                )}
              >
                {f.dot && (
                  <span className={cn("h-1.5 w-1.5 rounded-full", f.dot)} />
                )}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {admin && (
          <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-[12.5px] text-brand-700">
            <IconEdit className="h-4 w-4" />
            편집모드입니다. 셀을 클릭해 과업명·담당자·신호등 색상을 수정하세요.
            변경 내용은 자동 저장됩니다.
          </div>
        )}

        <PostMatrix matrix={view} admin={admin} onCellClick={onCellClick} />

        <p className="text-center text-[11.5px] text-ink-400">
          신호등 · 빨간불: 즉시 교체·검증 / 노란불: 지켜보기 / 파란불: EBG 통과
        </p>

        <ExcelPanel />
      </div>

      <ScorerPanel cellRef={scorerCell} onClose={() => setScorerCell(null)} />
      <CellEditModal cellRef={editCell} onClose={() => setEditCell(null)} />
    </>
  );
}
