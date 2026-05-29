import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/80 backdrop-blur">
      <div className="flex items-end justify-between gap-4 px-8 py-5">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-ink-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-[13.5px] text-ink-500">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
