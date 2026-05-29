"use client";

import { useEffect, useState } from "react";
import { CellRef } from "./PostMatrix";
import { PostColor } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { IconClose } from "@/components/ui/icons";
import { COLOR_LABEL, COLOR_MEANING } from "@/lib/data/matrix";

const COLORS: PostColor[] = ["red", "yellow", "blue", "empty"];
const DOT: Record<PostColor, string> = {
  red: "bg-signal-red",
  yellow: "bg-signal-amber",
  blue: "bg-signal-green", // 파란불 = 초록색
  green: "bg-signal-green",
  empty: "bg-ink-300",
};

export function CellEditModal({
  cellRef,
  onClose,
}: {
  cellRef: CellRef | null;
  onClose: () => void;
}) {
  const updateCell = useAppStore((s) => s.updateCell);
  const [title, setTitle] = useState("");
  const [person, setPerson] = useState("");
  const [color, setColor] = useState<PostColor>("yellow");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (cellRef) {
      setTitle(cellRef.cell.title ?? "");
      setPerson(cellRef.cell.person ?? "");
      setColor(cellRef.cell.color ?? "yellow");
      setMemo(cellRef.cell.memo ?? "");
    }
  }, [cellRef]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (cellRef) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cellRef, onClose]);

  if (!cellRef) return null;

  const save = () => {
    updateCell(cellRef.rowId, cellRef.type, cellRef.idx, {
      title,
      person,
      color,
      memo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade bg-ink-900/30"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[460px] animate-fade rounded-2xl bg-surface p-5 shadow-pop">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[16px] font-bold text-ink-900">포스트 셀 편집</h3>
            <p className="mt-0.5 text-[12.5px] text-ink-500">
              {cellRef.positionLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-canvas"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-ink-700">
              과업·포지션명
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="예: 통합 MDP(소싱)"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-ink-700">
              담당자
            </label>
            <input
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              className="input"
              placeholder="예: 홍길동(과장/38)  ·  공석이면 비워두세요"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-ink-700">
              상태 신호등
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition",
                    color === c
                      ? "border-brand-600 bg-brand-50 text-ink-900"
                      : "border-line bg-surface text-ink-500 hover:bg-canvas"
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", DOT[c])} />
                  {COLOR_LABEL[c]}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11.5px] text-ink-400">
              {COLOR_MEANING[color]}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-ink-700">
              메모 (선택)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="input min-h-[60px] resize-none"
              placeholder="포스트 관련 메모"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">
            취소
          </button>
          <button onClick={save} className="btn-primary">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
