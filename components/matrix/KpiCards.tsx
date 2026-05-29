import { MatrixKPI } from "@/lib/data/matrix";
import { cn } from "@/lib/utils";

function pct(n: number, total: number) {
  return total ? Math.round((n / total) * 100) : 0;
}

export function KpiCards({ kpi }: { kpi: MatrixKPI }) {
  const items = [
    {
      label: "전체 포스트",
      value: kpi.total,
      sub: "관리 중인 핵심 포스트",
      tone: "text-ink-900",
      bar: "bg-ink-300",
      ratio: 100,
    },
    {
      label: "빨간불",
      value: kpi.red,
      sub: `즉시 교체·검증 · ${pct(kpi.red, kpi.total)}%`,
      tone: "text-signal-red",
      bar: "bg-signal-red",
      ratio: pct(kpi.red, kpi.total),
    },
    {
      label: "노란불",
      value: kpi.yellow,
      sub: `지켜보기 · ${pct(kpi.yellow, kpi.total)}%`,
      tone: "text-signal-amber",
      bar: "bg-signal-amber",
      ratio: pct(kpi.yellow, kpi.total),
    },
    {
      label: "파란불",
      value: kpi.blue + kpi.green,
      sub: `EBG 통과 · ${pct(kpi.blue + kpi.green, kpi.total)}%`,
      tone: "text-signal-green",
      bar: "bg-signal-green",
      ratio: pct(kpi.blue + kpi.green, kpi.total),
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {items.map((it) => (
        <div key={it.label} className="card px-5 py-4">
          <div className="text-[13px] font-medium text-ink-500">{it.label}</div>
          <div
            className={cn(
              "mt-1.5 text-[30px] font-bold leading-none tracking-tight",
              it.tone
            )}
          >
            {it.value}
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
            <div
              className={cn("h-full rounded-full", it.bar)}
              style={{ width: `${it.ratio}%` }}
            />
          </div>
          <div className="mt-2 text-[12px] text-ink-400">{it.sub}</div>
        </div>
      ))}
    </div>
  );
}
