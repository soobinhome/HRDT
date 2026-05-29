import { PostColor } from "@/lib/types";
import { cn } from "@/lib/utils";

const SIGNAL: Record<string, { dot: string; chipBg: string; chipText: string }> =
  {
    red: { dot: "bg-signal-red", chipBg: "bg-signal-redBg", chipText: "text-signal-red" },
    yellow: {
      dot: "bg-signal-amber",
      chipBg: "bg-signal-amberBg",
      chipText: "text-signal-amber",
    },
    blue: {
      dot: "bg-signal-blue",
      chipBg: "bg-signal-blueBg",
      chipText: "text-signal-blue",
    },
    green: {
      dot: "bg-signal-green",
      chipBg: "bg-signal-greenBg",
      chipText: "text-signal-green",
    },
    empty: { dot: "bg-ink-300", chipBg: "bg-canvas", chipText: "text-ink-400" },
  };

export function SignalDot({
  color,
  className,
}: {
  color: PostColor;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        SIGNAL[color]?.dot,
        className
      )}
    />
  );
}

export function SignalChip({
  color,
  label,
}: {
  color: PostColor;
  label: string;
}) {
  const s = SIGNAL[color] ?? SIGNAL.empty;
  return (
    <span className={cn("chip", s.chipBg, s.chipText)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {label}
    </span>
  );
}

// 종합 적합도 원형 진행률
export function ScoreRing({
  value,
  size = 64,
  stroke = 6,
  color = "#1E40AF",
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#EDEFF3"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span
          className="font-bold tracking-tight text-ink-900"
          style={{ fontSize: size * 0.3 }}
        >
          {Math.round(value)}
        </span>
        {label && (
          <span className="mt-0.5 text-[9px] font-medium text-ink-400">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

// 5차원 레이더 차트
export function Radar({
  data,
  size = 220,
  color = "#1E40AF",
}: {
  data: { label: string; value: number }[]; // value 0~100
  size?: number;
  color?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 34;
  const n = data.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, v: number) => {
    const rr = (radius * Math.max(0, Math.min(100, v))) / 100;
    return [cx + rr * Math.cos(angle(i)), cy + rr * Math.sin(angle(i))];
  };
  const polygon = data
    .map((d, i) => point(i, d.value).join(","))
    .join(" ");
  const rings = [25, 50, 75, 100];

  return (
    <svg width={size} height={size} className="overflow-visible">
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={data
            .map((_, i) => point(i, ring).join(","))
            .join(" ")}
          fill="none"
          stroke="#EAECF0"
          strokeWidth={1}
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = point(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#EAECF0"
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={polygon}
        fill={color}
        fillOpacity={0.14}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const [x, y] = point(i, d.value);
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
      {data.map((d, i) => {
        const [x, y] = point(i, 118);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink-500"
            style={{ fontSize: 10.5, fontWeight: 600 }}
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
