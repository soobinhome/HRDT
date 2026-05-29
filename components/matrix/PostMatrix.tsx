"use client";

import { PostCell, PostColor, PostRow, PostType } from "@/lib/types";
import { cn, personMeta, personName } from "@/lib/utils";

export interface CellRef {
  rowId: string;
  area: string;
  type: PostType;
  idx: number;
  cell: PostCell;
  positionLabel: string;
}

// 신호등 = 셀 전체 색. 파란불(blue)은 워딩만 파란불, 실제 색은 초록.
// green은 호환용으로 blue와 동일 처리.
const CELL_FILL: Record<
  PostColor,
  { bg: string; name: string; title: string; meta: string }
> = {
  red: {
    bg: "bg-signal-red hover:brightness-[1.04]",
    name: "text-white",
    title: "text-white/80",
    meta: "text-white/75",
  },
  yellow: {
    bg: "bg-signal-amber hover:brightness-[1.04]",
    name: "text-ink-900",
    title: "text-ink-900/70",
    meta: "text-ink-900/65",
  },
  blue: {
    bg: "bg-signal-green hover:brightness-[1.04]",
    name: "text-white",
    title: "text-white/80",
    meta: "text-white/75",
  },
  green: {
    bg: "bg-signal-green hover:brightness-[1.04]",
    name: "text-white",
    title: "text-white/80",
    meta: "text-white/75",
  },
  empty: {
    bg: "",
    name: "",
    title: "",
    meta: "",
  },
};

function Cell({
  cellRef,
  admin,
  onClick,
}: {
  cellRef: CellRef;
  admin: boolean;
  onClick: (ref: CellRef) => void;
}) {
  const { cell } = cellRef;
  const name = personName(cell.person);
  const meta = personMeta(cell.person);
  const vacant = !name || name === "-";
  const blank = cell.color === "empty" && !cell.title && !name;

  if (blank) {
    return (
      <button
        onClick={() => onClick(cellRef)}
        className={cn(
          "flex h-[72px] w-full min-w-0 items-center justify-center rounded-lg border border-dashed border-line bg-canvas text-ink-300 transition",
          admin && "hover:border-brand-300 hover:text-brand-400"
        )}
      >
        <span className="text-lg leading-none">{admin ? "+" : "·"}</span>
      </button>
    );
  }

  const s = CELL_FILL[cell.color] ?? CELL_FILL.empty;

  return (
    <button
      onClick={() => onClick(cellRef)}
      className={cn(
        "flex h-[72px] w-full min-w-0 flex-col justify-center gap-0.5 rounded-lg px-3 py-2 text-left shadow-sm transition hover:shadow-card",
        s.bg
      )}
    >
      {cell.title && (
        <span className={cn("truncate text-[11px] font-medium", s.title)}>
          {cell.title}
        </span>
      )}
      {vacant ? (
        <span className={cn("text-[14px] font-bold leading-tight", s.name)}>
          공석
        </span>
      ) : (
        <>
          <span
            className={cn(
              "truncate text-[15px] font-bold leading-tight",
              s.name
            )}
          >
            {name}
          </span>
          {meta && (
            <span className={cn("truncate text-[11px] font-medium", s.meta)}>
              {meta}
            </span>
          )}
        </>
      )}
    </button>
  );
}

export function PostMatrix({
  matrix,
  admin,
  onCellClick,
}: {
  matrix: PostRow[];
  admin: boolean;
  onCellClick: (ref: CellRef) => void;
}) {
  const headers = [
    "법인 / 조직",
    "현직자 (F1)",
    "F2",
    "F3",
    "1번 날개",
    "2번 날개",
    "3번 날개",
    "4번 날개",
    "5번 날개",
  ];

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[1180px]">
          {/* header */}
          <div className="grid grid-cols-[120px_repeat(8,minmax(0,1fr))] gap-1.5 border-b border-line bg-canvas px-3 py-2.5">
            {headers.map((h, i) => (
              <div
                key={i}
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-wide text-ink-400",
                  i === 0 && "pl-1"
                )}
              >
                {h}
              </div>
            ))}
          </div>

          {/* rows */}
          <div className="divide-y divide-line">
            {matrix.map((row) => {
              const succLabel = ["F2", "F3"];
              const cells: { ref: CellRef }[] = [];
              cells.push({
                ref: {
                  rowId: row.id,
                  area: row.area,
                  type: "current",
                  idx: 0,
                  cell: row.current,
                  positionLabel: `${row.area} 현직자 (F1)`,
                },
              });
              row.successors.forEach((c, i) =>
                cells.push({
                  ref: {
                    rowId: row.id,
                    area: row.area,
                    type: "successor",
                    idx: i,
                    cell: c,
                    positionLabel: `${row.area} 후계자 ${succLabel[i] ?? `F${i + 2}`}`,
                  },
                })
              );
              row.wings.forEach((c, i) =>
                cells.push({
                  ref: {
                    rowId: row.id,
                    area: row.area,
                    type: "wing",
                    idx: i,
                    cell: c,
                    positionLabel: `${row.area} ${c.title || `${i + 1}번 날개`}`,
                  },
                })
              );

              return (
                <div
                  key={row.id}
                  className="grid grid-cols-[120px_repeat(8,minmax(0,1fr))] items-stretch gap-1.5 px-3 py-1.5"
                >
                  <div className="flex min-w-0 flex-col justify-center pl-1">
                    <span className="truncate text-[13.5px] font-bold text-ink-900">
                      {row.area}
                    </span>
                    {row.level && (
                      <span className="text-[11px] font-semibold text-ink-400">
                        ({row.level})
                      </span>
                    )}
                  </div>
                  {cells.map(({ ref }, i) => (
                    <Cell
                      key={i}
                      cellRef={ref}
                      admin={admin}
                      onClick={onCellClick}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
