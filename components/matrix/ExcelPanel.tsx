"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  buildTemplateBlob,
  downloadBlob,
  parseMatrixWorkbook,
  EXCEL_HEADERS,
  EXCEL_GUIDE,
} from "@/lib/excel";
import { PostRow } from "@/lib/types";
import { IconDoc, IconUpload, IconWarn, IconCheck, IconClose } from "@/components/ui/icons";

function filledCount(rows: PostRow[]) {
  return rows
    .flatMap((r) => [r.current, ...r.successors, ...r.wings])
    .filter((c) => c.color !== "empty" && (c.title || c.person)).length;
}

export function ExcelPanel() {
  const setMatrix = useAppStore((s) => s.setMatrix);
  const resetMatrix = useAppStore((s) => s.resetMatrix);
  const inputRef = useRef<HTMLInputElement>(null);

  const [pending, setPending] = useState<PostRow[] | null>(null);
  const [pendingName, setPendingName] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const onDownload = () => {
    downloadBlob(buildTemplateBlob(), "포스트매트릭스_입력양식.xlsx");
    setDone("입력 양식(.xlsx)을 다운로드했습니다.");
    setTimeout(() => setDone(""), 2400);
  };

  const onFile = async (file: File) => {
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const rows = parseMatrixWorkbook(buf);
      if (!rows.length) {
        setError("유효한 데이터 행을 찾지 못했습니다. 양식을 확인해주세요.");
        return;
      }
      setPending(rows);
      setPendingName(file.name);
    } catch {
      setError("엑셀 파일을 읽지 못했습니다. .xlsx 형식인지 확인해주세요.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const confirmReplace = () => {
    if (!pending) return;
    setMatrix(pending);
    setDone(`매트릭스를 교체했습니다 (${pending.length}개 조직).`);
    setPending(null);
    setTimeout(() => setDone(""), 2800);
  };

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[560px]">
          <h3 className="text-[15px] font-bold text-ink-900">
            엑셀로 데이터 관리
          </h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
            입력 양식을 내려받아 작성한 뒤 업로드하면 매트릭스 전체가 교체됩니다.
            업로드 파일은 브라우저에서만 처리되며 서버에 저장되지 않습니다.
          </p>
          <div className="mt-2.5 rounded-xl bg-canvas px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-500">
            <span className="font-semibold text-ink-700">열 구성</span> ·{" "}
            {EXCEL_HEADERS.join(" / ")}
            <br />
            {EXCEL_GUIDE}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <button onClick={onDownload} className="btn-subtle justify-center">
            <IconDoc className="h-4 w-4" /> 입력 양식 다운로드
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="btn-primary justify-center"
          >
            <IconUpload className="h-4 w-4" /> 엑셀 업로드
          </button>
          <button
            onClick={() => {
              resetMatrix();
              setDone("샘플 데이터로 초기화했습니다.");
              setTimeout(() => setDone(""), 2400);
            }}
            className="btn-ghost justify-center text-[12.5px]"
          >
            샘플로 초기화
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-signal-redBg px-3.5 py-2.5 text-[12.5px] font-medium text-signal-red">
          <IconWarn className="h-4 w-4" /> {error}
        </div>
      )}
      {done && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-signal-greenBg px-3.5 py-2.5 text-[12.5px] font-medium text-signal-green">
          <IconCheck className="h-4 w-4" /> {done}
        </div>
      )}

      {pending && (
        <ConfirmModal
          rows={pending}
          fileName={pendingName}
          onCancel={() => setPending(null)}
          onConfirm={confirmReplace}
        />
      )}
    </div>
  );
}

function ConfirmModal({
  rows,
  fileName,
  onCancel,
  onConfirm,
}: {
  rows: PostRow[];
  fileName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade bg-ink-900/30" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-[460px] animate-fade rounded-2xl bg-surface p-5 shadow-pop">
        <div className="flex items-start justify-between">
          <h3 className="text-[16px] font-bold text-ink-900">매트릭스 교체 확인</h3>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-canvas"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          <span className="font-semibold text-ink-700">{fileName}</span> 내용으로
          기존 매트릭스를 전부 대체합니다. 이 작업은 되돌릴 수 없습니다(새로고침 전
          “샘플로 초기화”로 복구 가능).
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-canvas px-3.5 py-2.5">
            <div className="text-[11px] font-semibold text-ink-400">조직 수</div>
            <div className="mt-0.5 text-[18px] font-bold text-ink-900">
              {rows.length}
            </div>
          </div>
          <div className="rounded-xl bg-canvas px-3.5 py-2.5">
            <div className="text-[11px] font-semibold text-ink-400">
              채워진 포스트
            </div>
            <div className="mt-0.5 text-[18px] font-bold text-ink-900">
              {filledCount(rows)}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="btn-ghost">
            취소
          </button>
          <button onClick={onConfirm} className="btn-primary">
            전체 교체
          </button>
        </div>
      </div>
    </div>
  );
}
