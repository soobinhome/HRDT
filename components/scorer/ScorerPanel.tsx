"use client";

import { useMemo, useState } from "react";
import { Drawer, DrawerHeader } from "@/components/ui/Drawer";
import { CellRef } from "@/components/matrix/PostMatrix";
import { SAMPLE_EMPLOYEES, findEmployeeByName } from "@/lib/data/employees";
import { resolveTaskProfile } from "@/lib/data/taskProfiles";
import { rankCandidates } from "@/lib/scoring";
import { ScoredCandidate, ReviewStatus, Verdict } from "@/lib/types";
import { Radar, ScoreRing } from "@/components/ui/dataviz";
import { cn, personName } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import {
  IconCheck,
  IconWarn,
  IconSpark,
  IconArrowRight,
} from "@/components/ui/icons";

const VERDICT_TONE: Record<Verdict, { ring: string; chip: string; text: string }> =
  {
    "즉시 검토": {
      ring: "#1B9E6B",
      chip: "bg-signal-greenBg text-signal-green",
      text: "text-signal-green",
    },
    "육성 후보": {
      ring: "#D9920A",
      chip: "bg-signal-amberBg text-signal-amber",
      text: "text-signal-amber",
    },
    "후순위/보류": {
      ring: "#878E9C",
      chip: "bg-canvas text-ink-500",
      text: "text-ink-500",
    },
  };

const STATUS_FLOW: ReviewStatus[] = [
  "추천됨",
  "검토중",
  "추가확인",
  "인터뷰",
  "발령후보",
  "발령승인",
  "발령보류",
  "발령제외",
];

function Bar({
  label,
  value,
  weight,
}: {
  label: string;
  value: number;
  weight: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="font-medium text-ink-700">
          {label}
          <span className="ml-1 text-ink-300">{weight}</span>
        </span>
        <span className="font-semibold text-ink-900">{Math.round(value)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas">
        <div
          className="h-full rounded-full bg-brand-600"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function ScorerPanel({
  cellRef,
  onClose,
}: {
  cellRef: CellRef | null;
  onClose: () => void;
}) {
  const open = Boolean(cellRef);
  const taskKey = cellRef?.cell.taskKey;
  const prof = useMemo(() => resolveTaskProfile(taskKey), [taskKey]);
  const incumbentName = cellRef ? personName(cellRef.cell.person) : "";
  const excludeName =
    incumbentName && incumbentName !== "-" ? incumbentName : undefined;

  const ranked = useMemo<ScoredCandidate[]>(
    () =>
      cellRef
        ? rankCandidates(prof, SAMPLE_EMPLOYEES, { limit: 6, excludeName })
        : [],
    [cellRef, prof, excludeName]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    ranked.find((r) => r.id === selectedId) ?? ranked[0] ?? null;

  const anchor = findEmployeeByName(prof.anchor);

  return (
    <Drawer open={open} onClose={onClose} width={1040}>
      {cellRef && (
        <>
          <DrawerHeader
            title={`내부 후보 판별기`}
            subtitle={`${cellRef.positionLabel} · 과업 「${prof.label}」 기준 scoreTalent V8.0`}
            onClose={onClose}
            badge={
              <span className="chip bg-brand-50 text-brand-700">
                <IconSpark className="h-3 w-3" /> {prof.group}
              </span>
            }
          />

          <div className="grid flex-1 grid-cols-[336px_1fr] overflow-hidden">
            {/* ── 후보 랭킹 리스트 ── */}
            <div className="flex flex-col overflow-y-auto border-r border-line bg-surface">
              <div className="border-b border-line px-5 py-3">
                <p className="text-[12.5px] leading-snug text-ink-500">
                  {prof.desc}
                </p>
                {anchor && (
                  <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-canvas px-3 py-2">
                    <span className="text-[11px] font-semibold text-ink-400">
                      현직자 앵커
                    </span>
                    <span className="text-[12.5px] font-semibold text-ink-900">
                      {anchor.name}
                    </span>
                    <span className="text-[11px] text-ink-400">
                      {anchor.grade} · {anchor.orgName}
                    </span>
                  </div>
                )}
              </div>

              <div className="px-3 py-3">
                <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  추천 후보 {ranked.length}명
                </div>
                <ul className="space-y-1.5">
                  {ranked.map((c, i) => {
                    const tone = VERDICT_TONE[c.match.verdict];
                    const active = selected?.id === c.id;
                    return (
                      <li key={c.id}>
                        <button
                          onClick={() => setSelectedId(c.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                            active
                              ? "border-brand-200 bg-brand-50"
                              : "border-transparent hover:bg-canvas"
                          )}
                        >
                          <span className="w-4 text-center text-[13px] font-bold text-ink-300">
                            {i + 1}
                          </span>
                          <ScoreRing
                            value={c.match.totalScore}
                            size={40}
                            stroke={4}
                            color={tone.ring}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate text-[13.5px] font-semibold text-ink-900">
                                {c.name}
                              </span>
                              <span className="text-[11px] text-ink-400">
                                {c.grade}
                              </span>
                            </span>
                            <span className="mt-0.5 flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "chip px-1.5 py-0.5 text-[10.5px]",
                                  tone.chip
                                )}
                              >
                                {c.match.verdict}
                              </span>
                              <span className="truncate text-[11px] text-ink-400">
                                {c.orgName}
                              </span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* ── 후보 상세 ── */}
            <div className="overflow-y-auto px-6 py-5">
              {selected ? (
                <CandidateDetail
                  cand={selected}
                  anchorName={prof.anchor}
                  taskKey={prof.key}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-ink-400">
                  후보를 선택하세요
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}

function CandidateDetail({
  cand,
  anchorName,
  taskKey,
}: {
  cand: ScoredCandidate;
  anchorName?: string;
  taskKey: string;
}) {
  const m = cand.match;
  const tone = VERDICT_TONE[m.verdict];
  const setReview = useAppStore((s) => s.setReview);
  const review = useAppStore((s) => s.reviews[`${cand.id}__${taskKey}`]);
  const [status, setStatus] = useState<ReviewStatus>(
    review?.status ?? "추천됨"
  );
  const [memo, setMemo] = useState(review?.memo ?? "");
  const [saved, setSaved] = useState(false);

  const radarData = [
    { label: "역량", value: m.capability },
    { label: "DISC", value: m.discFit },
    { label: "강점", value: m.strengthFit },
    { label: "즉시성", value: m.readiness },
    { label: "직무부합", value: m.postFit },
  ];

  const onSave = () => {
    setReview(cand.id, taskKey, status, memo);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <ScoreRing
          value={m.totalScore}
          size={76}
          stroke={7}
          color={tone.ring}
          label="종합"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[19px] font-bold tracking-tight text-ink-900">
              {cand.name}
            </h3>
            <span className={cn("chip", tone.chip)}>{m.verdict}</span>
          </div>
          <p className="mt-0.5 text-[13px] text-ink-500">
            {cand.grade} · {cand.orgName} · {cand.age}세 · {cand.disc}형 ·{" "}
            {cand.mbti}
          </p>
          <p className="mt-0.5 text-[12px] text-ink-400">
            직무 태그: {cand.job.join(", ")}
          </p>
        </div>
      </div>

      {/* 점수 분해 + 레이더 */}
      <div className="grid grid-cols-[1fr_260px] gap-5">
        <div className="card space-y-3 p-4">
          <div className="text-[13px] font-bold text-ink-900">
            점수 분해 (가중치)
          </div>
          <Bar label="현직자 앵커 유사도" value={m.anchorSimilarity} weight="25%" />
          <Bar label="포스트 특수성 부합" value={m.postFit} weight="20%" />
          <Bar label="핵심 역량" value={m.capability} weight="20%" />
          <Bar label="DISC 적합도" value={m.discFit} weight="13%" />
          <Bar label="강점 매칭" value={m.strengthFit} weight="12%" />
          <Bar label="즉시성" value={m.readiness} weight="10%" />
        </div>
        <div className="card flex flex-col items-center justify-center p-4">
          <div className="self-start text-[13px] font-bold text-ink-900">
            5차원 프로필
          </div>
          <Radar data={radarData} size={200} />
        </div>
      </div>

      {/* 현직자 대비 비교 */}
      {m.anchorDiff && anchorName && (
        <div className="card p-4">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink-900">
            현직자({anchorName}) 대비 비교
            <span className="chip bg-brand-50 text-brand-700">신규</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <DiffCol
              title="우위 항목"
              tone="text-signal-green"
              items={m.anchorDiff.betterAt}
              empty="두드러진 우위 없음"
            />
            <DiffCol
              title="보완 필요"
              tone="text-signal-red"
              items={m.anchorDiff.weakerAt}
              empty="현직자 수준 충족"
            />
            <DiffCol
              title="보완 강점"
              tone="text-brand-700"
              items={m.anchorDiff.complementStrengths}
              empty="-"
            />
          </div>
        </div>
      )}

      {/* 판별 근거 + 리스크 */}
      <div className="grid grid-cols-2 gap-5">
        <div className="card p-4">
          <div className="mb-2.5 text-[13px] font-bold text-ink-900">
            판별 근거
          </div>
          <ul className="space-y-2">
            {m.reasons.length ? (
              m.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px] text-ink-700">
                  <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" />
                  {r}
                </li>
              ))
            ) : (
              <li className="text-[12.5px] text-ink-400">근거 데이터 부족</li>
            )}
          </ul>
        </div>
        <div className="card p-4">
          <div className="mb-2.5 text-[13px] font-bold text-ink-900">
            리스크 노트
          </div>
          <ul className="space-y-2">
            {m.risks.length ? (
              m.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px] text-ink-700">
                  <IconWarn className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-amber" />
                  {r}
                </li>
              ))
            ) : (
              <li className="text-[12.5px] text-ink-400">
                특이 리스크 없음
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* 발령 검토 상태 */}
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[13px] font-bold text-ink-900">발령 검토</div>
          {review && (
            <span className="text-[11px] text-ink-400">
              최근 변경 {new Date(review.updatedAt).toLocaleDateString("ko-KR")}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition",
                status === s
                  ? "border-brand-600 bg-brand-700 text-white"
                  : "border-line bg-surface text-ink-500 hover:bg-canvas"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="검토 메모 (예: EBG 통과 후 재검토, 1:1 면담 예정 등)"
          className="input mt-3 min-h-[72px] resize-none"
        />
        <div className="mt-3 flex items-center justify-end gap-2">
          {saved && (
            <span className="text-[12px] font-medium text-signal-green">
              저장되었습니다
            </span>
          )}
          <button onClick={onSave} className="btn-primary">
            검토 상태 저장
            <IconArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="pb-2 text-center text-[11px] text-ink-400">
        본 추천 결과는 참고·검토용입니다. 최종 인사결정은 별도 절차를 따릅니다.
      </p>
    </div>
  );
}

function DiffCol({
  title,
  tone,
  items,
  empty,
}: {
  title: string;
  tone: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className="rounded-xl bg-canvas p-3">
      <div className={cn("mb-1.5 text-[11.5px] font-bold", tone)}>{title}</div>
      {items.length ? (
        <div className="flex flex-wrap gap-1">
          {items.map((it) => (
            <span
              key={it}
              className="rounded-md bg-surface px-1.5 py-0.5 text-[11.5px] font-medium text-ink-700"
            >
              {it}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-[11.5px] text-ink-400">{empty}</span>
      )}
    </div>
  );
}
