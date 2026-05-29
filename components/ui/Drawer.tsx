"use client";

import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";
import { IconClose } from "@/components/ui/icons";

export function Drawer({
  open,
  onClose,
  children,
  width = 980,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 animate-fade bg-ink-900/30"
        onClick={onClose}
      />
      <div
        className="absolute inset-y-0 right-0 flex w-full max-w-full animate-panel flex-col bg-canvas shadow-pop"
        style={{ maxWidth: width }}
      >
        {children}
      </div>
    </div>
  );
}

export function DrawerHeader({
  title,
  subtitle,
  onClose,
  badge,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  badge?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line bg-surface px-6 py-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-[17px] font-bold tracking-tight text-ink-900">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-0.5 truncate text-[13px] text-ink-500">{subtitle}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-400 transition hover:bg-canvas hover:text-ink-700"
        )}
        aria-label="닫기"
      >
        <IconClose className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
