"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { parseResumeAsync } from "@/lib/parse";
import { DEMO_RESUME_TEXT } from "@/lib/data/external";
import { scoreExternalFit } from "@/lib/scoring";
import { resolveTaskProfile, TASK_PROFILES, TASK_KEYS } from "@/lib/data/taskProfiles";
import { CandidateExternal, ParsedResume } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconClose, IconUpload, IconDoc, IconSpark, IconCheck } from "@/components/ui/icons";

type Step = "input" | "parsing" | "review";

const GROUPED = TASK_KEYS.reduce<Record<string, string[]>>((acc, k) => {
  const g = TASK_PROFILES[k].group;
  (acc[g] ??= []).push(k);
  return acc;
}, {});

export function UploadModal({ onClose }: { onClose: () => void }) {
  const addExternal = useAppStore((s) => s.addExternal);

  const [step, setStep] = useState<Step>("input");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [drag, setDrag] = useState(false);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [taskKey, setTaskKey] = useState<string>(TASK_KEYS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const readFile = (file: File) => {
    setFileName(file.name);
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = () => setText(String(reader.result ?? ""));
      reader.readAsText(file);
    } else {
      // PDF/DOCX 텍스트 추출은 백엔드(Claude API) 연동 시 처리.
      // 시연에서는 추출 결과를 가정한 샘플 텍스트를 사용.
      setText(DEMO_RESUME_TEXT);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const useSample = () => {
    setFileName("강민서_경력기술서.pdf");
    setText(DEMO_RESUME_TEXT);
  };

  const runParse = async () => {
    setStep("parsing");
    const result = await parseResumeAsync(text || DEMO_RESUME_TEXT, 1300);
    setParsed(result);
    // 직무분야 키워드로 가장 근접한 과업을 기본 선택
    const lower = (result.jobField + " " + result.skills.join(" ")).toLowerCase();
    const best = TASK_KEYS.map((k) => ({
      k,
      s: scoreExternalFit(result.fitKeywords, result.skills, TASK_PROFILES[k]),
      hit: TASK_PROFILES[k].mustJob.some((j) => lower.includes(j.toLowerCase())),
    }))
      .sort((a, b) => Number(b.hit) - Number(a.hit) || b.s - a.s)[0];
    if (best) setTaskKey(best.k);
    setStep("review");
  };

  const patch = (p: Partial<ParsedResume>) =>
    setParsed((prev) => (prev ? { ...prev, ...p } : prev));

  const save = () => {
    if (!parsed) return;
    const prof = resolveTaskProfile(taskKey);
    const fitScore = scoreExternalFit(parsed.fitKeywords, parsed.skills, prof);
    const cand: CandidateExternal = {
      id: `ext-${Date.now()}`,
      name: parsed.name,
      company: parsed.company,
      grade: parsed.grade,
      jobField: parsed.jobField,
      careerSummary: parsed.careerSummary,
      achievements: parsed.achievements,
      parsedSkills: parsed.skills,
      fitKeywords: parsed.fitKeywords,
      status: "1차검토",
      assignedTaskKey: taskKey,
      fitScore,
      createdAt: new Date().toISOString().slice(0, 10),
      sourceFile: fileName || "직접입력.txt",
    };
    addExternal(cand);
    onClose();
  };

  const prof = resolveTaskProfile(taskKey);
  const previewFit = parsed
    ? scoreExternalFit(parsed.fitKeywords, parsed.skills, prof)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade bg-ink-900/30" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-[560px] animate-fade flex-col overflow-hidden rounded-2xl bg-surface shadow-pop">
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-[16px] font-bold text-ink-900">
              <IconSpark className="h-4 w-4 text-brand-700" />
              외부 인재 이력서 업로드
            </h3>
            <p className="mt-0.5 text-[12.5px] text-ink-500">
              PDF·문서를 올리면 AI가 핵심 경력을 자동 추출합니다 (시연: 샘플 파싱)
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-canvas"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "input" && (
            <div className="space-y-3.5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-9 text-center transition",
                  drag
                    ? "border-brand-600 bg-brand-50"
                    : "border-line bg-canvas hover:border-brand-200"
                )}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <IconUpload className="h-5 w-5" />
                </div>
                <div className="text-[13.5px] font-semibold text-ink-700">
                  {fileName || "이력서 파일을 드래그하거나 클릭해 선택"}
                </div>
                <div className="text-[11.5px] text-ink-400">
                  PDF · DOCX · TXT 지원 · 업로드 후 파싱 결과는 즉시 삭제(시연)
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) readFile(f);
                  }}
                />
              </div>

              <div className="flex items-center gap-2 text-[11.5px] text-ink-400">
                <span className="h-px flex-1 bg-line" />또는 텍스트 직접 입력
                <span className="h-px flex-1 bg-line" />
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="이력서·경력기술서 텍스트를 붙여넣으세요"
                className="input min-h-[120px] resize-none font-mono text-[12px] leading-relaxed"
              />

              <button onClick={useSample} className="btn-subtle w-full justify-center">
                <IconDoc className="h-4 w-4" /> 샘플 이력서로 시연하기
              </button>
            </div>
          )}

          {step === "parsing" && (
            <div className="flex flex-col items-center justify-center gap-4 py-14">
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-700" />
              <div className="text-center">
                <div className="text-[14px] font-semibold text-ink-900">
                  AI가 이력서를 분석하고 있습니다
                </div>
                <div className="mt-1 text-[12px] text-ink-400">
                  경력·성과·역량 키워드 추출 중…
                </div>
              </div>
            </div>
          )}

          {step === "review" && parsed && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 rounded-xl bg-signal-greenBg px-3.5 py-2.5 text-[12.5px] font-medium text-signal-green">
                <IconCheck className="h-4 w-4" /> 추출 완료 · 내용을 확인하고 수정하세요
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="이름" value={parsed.name} onChange={(v) => patch({ name: v })} />
                <Field label="현 직장" value={parsed.company} onChange={(v) => patch({ company: v })} />
                <Field label="직급 / 연차" value={parsed.grade} onChange={(v) => patch({ grade: v })} />
                <Field label="직무 분야" value={parsed.jobField} onChange={(v) => patch({ jobField: v })} />
              </div>

              <FieldArea
                label="경력 요약"
                value={parsed.careerSummary}
                onChange={(v) => patch({ careerSummary: v })}
              />
              <FieldArea
                label="핵심 성과"
                value={parsed.achievements}
                onChange={(v) => patch({ achievements: v })}
              />

              <div>
                <Label>추출 스킬</Label>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.skills.map((s) => (
                    <span key={s} className="chip bg-brand-50 text-brand-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>검토 대상 포스트(과업)</Label>
                <div className="flex items-center gap-2">
                  <select
                    value={taskKey}
                    onChange={(e) => setTaskKey(e.target.value)}
                    className="input flex-1"
                  >
                    {Object.entries(GROUPED).map(([g, keys]) => (
                      <optgroup key={g} label={g}>
                        {keys.map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-xl bg-canvas px-3 py-2">
                    <span className="text-[11px] font-semibold text-ink-400">적합도</span>
                    <span className="text-[16px] font-bold text-brand-700">{previewFit}</span>
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-ink-400">{prof.desc}</p>
              </div>
            </div>
          )}
        </div>

        {step !== "parsing" && (
          <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
            {step === "review" ? (
              <>
                <button onClick={() => setStep("input")} className="btn-ghost">
                  이전
                </button>
                <button onClick={save} className="btn-primary">
                  파이프라인에 추가
                </button>
              </>
            ) : (
              <>
                <button onClick={onClose} className="btn-ghost">
                  취소
                </button>
                <button
                  onClick={runParse}
                  disabled={!text.trim()}
                  className={cn("btn-primary", !text.trim() && "opacity-40")}
                >
                  <IconSpark className="h-4 w-4" /> AI 분석 시작
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-[12px] font-semibold text-ink-700">
      {children}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input" />
    </div>
  );
}

function FieldArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input min-h-[56px] resize-none text-[12.5px]"
      />
    </div>
  );
}
