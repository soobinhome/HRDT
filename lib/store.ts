"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CandidateExternal,
  PostCell,
  PostRow,
  PostType,
  ReviewRecord,
  ReviewStatus,
} from "./types";
import { SAMPLE_MATRIX } from "./data/matrix";
import { SAMPLE_EXTERNAL } from "./data/external";

function reviewKey(candidateId: string, taskKey: string) {
  return `${candidateId}__${taskKey}`;
}

interface AppState {
  // 시연 모드 (실명 데이터 미노출 — 현재는 항상 샘플)
  demoMode: boolean;
  toggleDemoMode: () => void;

  // 매트릭스
  matrix: PostRow[];
  admin: boolean;
  toggleAdmin: () => void;
  updateCell: (
    rowId: string,
    type: PostType,
    idx: number,
    patch: Partial<PostCell>
  ) => void;
  updateArea: (rowId: string, area: string) => void;
  setMatrix: (rows: PostRow[]) => void;
  resetMatrix: () => void;

  // 발령 검토 이력
  reviews: Record<string, ReviewRecord>;
  setReview: (
    candidateId: string,
    taskKey: string,
    status: ReviewStatus,
    memo: string
  ) => void;
  getReview: (candidateId: string, taskKey: string) => ReviewRecord | undefined;

  // 외부 인재
  externals: CandidateExternal[];
  addExternal: (c: CandidateExternal) => void;
  updateExternal: (id: string, patch: Partial<CandidateExternal>) => void;
  removeExternal: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      demoMode: true,
      toggleDemoMode: () => set((s) => ({ demoMode: !s.demoMode })),

      matrix: SAMPLE_MATRIX,
      admin: false,
      toggleAdmin: () => set((s) => ({ admin: !s.admin })),

      updateCell: (rowId, type, idx, patch) =>
        set((s) => ({
          matrix: s.matrix.map((row) => {
            if (row.id !== rowId) return row;
            if (type === "current") {
              return { ...row, current: { ...row.current, ...patch } };
            }
            const listKey = type === "successor" ? "successors" : "wings";
            const list = [...row[listKey]];
            list[idx] = { ...list[idx], ...patch };
            return { ...row, [listKey]: list };
          }),
        })),

      updateArea: (rowId, area) =>
        set((s) => ({
          matrix: s.matrix.map((row) =>
            row.id === rowId ? { ...row, area } : row
          ),
        })),

      setMatrix: (rows) => set({ matrix: rows }),

      resetMatrix: () => set({ matrix: SAMPLE_MATRIX }),

      reviews: {},
      setReview: (candidateId, taskKey, status, memo) =>
        set((s) => ({
          reviews: {
            ...s.reviews,
            [reviewKey(candidateId, taskKey)]: {
              candidateId,
              taskKey,
              status,
              memo,
              updatedAt: new Date().toISOString(),
            },
          },
        })),
      getReview: (candidateId, taskKey) =>
        get().reviews[reviewKey(candidateId, taskKey)],

      externals: SAMPLE_EXTERNAL,
      addExternal: (c) => set((s) => ({ externals: [c, ...s.externals] })),
      updateExternal: (id, patch) =>
        set((s) => ({
          externals: s.externals.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),
      removeExternal: (id) =>
        set((s) => ({ externals: s.externals.filter((c) => c.id !== id) })),
    }),
    {
      name: "hr-ctt-store-v1",
      partialize: (s) => ({
        matrix: s.matrix,
        reviews: s.reviews,
        externals: s.externals,
        demoMode: s.demoMode,
      }),
    }
  )
);
