"use client";

import { useMemo, useState } from "react";
import { Drawer, DrawerHeader } from "@/components/ui/Drawer";
import { ScoreRing } from "@/components/ui/dataviz";
import { useAppStore } from "@/lib/store";
import { scoreExternalFit } from "@/lib/scoring";
import { generateScenario } from "@/lib/parse";
import {
  resolveTaskProfile,
  TASK_PROFILES,
  TASK_KEYS,
} from "@/lib/data/taskProfiles";
import { findEmployeeByName } from "@/lib/data/employees";
import { CandidateExternal, ExternalStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  IconCheck,
  IconWarn,
  IconSpark,
  IconArrowRight,
  IconBuilding,
  IconStar,
  IconBolt,
  IconTrash,
} from "@/components/ui/icons";

const STATUS_FLOW: ExternalStatus[] = [
  "1차검토",
  "심층면접",
  "최종후보",
  "채용결정",
  "보류",
];

const STATUS_TONE: Record<ExternalStatus, string> = {
  "1차검토": "bg-canvas text-ink-500",
  심층면접: "bg-signal-blueBg text-signal-blue",
  최종후보: "bg-signal-amberBg text-signal-amber",
  채용결정: "bg-signal-greenBg text-signal-green",
  보류: "bg-canvas text-ink-400",
};

function fitColor(v: number) {
  if (v >= 78) return "#1B9E6B";
  if (v >= 62) return "#D9920A";
  return "#878E9C";
}

export function ExternalDetail({
  candidate,
  onClose,
}: {
  candidate: CandidateExternal | null;
  onClose: () => void;
}) {
  const open = Boolean(candidate);
  return (
    <Drawer open={open} onClose={onClose} width={960}>
      {candidate && <DetailBody candidate={candidate} onClose={onClose} />}
    </Drawer>
  );
}

function DetailBody({
  candidate,
  onClose,
}: {
  candidate: CandidateExternal;
  onClose: () => void;
}) {
  const updateExternal = useAppStore((s) => s.updateExternal);
  const removeExternal = useAppStore((s) => s.removeExternal);

  const taskKey = candidate.assignedTaskKey ?? TASK_KEYS[0];
  const prof = useMemo(() => resolveTaskProfile(taskKey), [taskKey]);
  const fitScore =
    candidate.fitScore ??
    scoreExternalFit(candidate.fitKeywords, candidate.parsedSkills, prof);

  const [status, setStatus] = useState<ExternalStatus>(candidate.status);
  const [memo, setMemo] = useState("");
  const [saved, setSaved] = useState(false);

  // 다른 포스트 추천 (적합도 상위, 현재 배정 제외)
  const otherFits = useMemo(
    () =>
      TASK_KEYS.filter((k) => k !== taskKey)
        .map((k) => ({
          key: k,
          group: TASK_PROFILES[k].group,
          score: scoreExternalFit(
            candidate.fitKeywords,
            candidate.parsedSkills,
            TASK_PROFILES[k]
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4),
    [candidate.fitKeywords, candidate.parsedSkills, taskKey]
  );

  const anchor = findEmployeeByName(prof.anchor);
  const scenario = useMemo(
    () => generateScenario(candidate, prof, fitScore),
    [candidate, prof, fitScore]
  );

  const onSaveStatus = () => {
    updateExternal(candidate.id, { status });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const reassign = (k: string) => {
    const s = scoreExternalFit(
      candidate.fitKeywords,
      candidate.parsedSkills,
      TASK_PROFILES[k]
    );
    updateExternal(candidate.id, { assignedTaskKey: k, fitScore: s });
  };

  const onDelete = () => {
    removeExternal(candidate.id);
    onClose();
  };

  return (
    <>
      <DrawerHeader
        title={candidate.name}
        subtitle={`${candidate.company} · ${candidate.grade}`}
        onClose={onClose}
        badge={
          <span className={cn("chip", STATUS_TONE[candidate.status])}>
            {candidate.status}
          </span>
        }
      />

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {/* 적합도 헤더 */}
        <div className="card flex items-center gap-5 p-5">
          <ScoreRing
            value={fitScore}
            size={84}
            stroke={7}
            color={fitColor(fitScore)}
            label="적합도"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[12px] text-ink-400">
              <IconSpark className="h-3.5 w-3.5" /> 검토 포스트
            </div>
            <div className="mt-0.5 text-[16px] font-bold text-ink-900">
              {prof.label}
            </div>
            <p className="mt-1 text-[12.5px] leading-snug text-ink-500">
              {prof.desc}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {candidate.parsedSkills.slice(0, 6).map((s) => (
                <span key={s} className="chip bg-brand-50 text-brand-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 경력 요약 / 성과 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink-900">
              <IconBuilding className="h-4 w-4 text-ink-400" /> 경력 요약
            </div>
            <p className="text-[12.5px] leading-relaxed text-ink-700">
              {candidate.careerSummary}
            </p>
            <div className="mt-2 text-[11.5px] text-ink-400">
              직무 분야: {candidate.jobField}
            </div>
          </div>
          <div className="card p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink-900">
              <IconBolt className="h-4 w-4 text-signal-amber" /> 핵심 성과
            </div>
            <p className="text-[12.5px] leading-relaxed text-ink-700">
              {candidate.achievements}
            </p>
          </div>
        </div>

        {/* 현직자 대비 비교 */}
        {anchor && (
          <div className="card p-4">
            <div className="mb-3 text-[13px] font-bold text-ink-900">
              현직자 대비 비교
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-canvas p-3.5">
                <div className="text-[11px] font-semibold text-ink-400">
                  외부 후보
                </div>
                <div className="mt-0.5 text-[14px] font-bold text-ink-900">
                  {candidate.name}
                </div>
                <div className="text-[11.5px] text-ink-500">
                  {candidate.company} · {candidate.grade}
                </div>
                <ul className="mt-2.5 space-y-1.5">
                  <CompareItem tone="text-signal-green" icon="up">
                    외부 검증된 실행 경험·정량 성과 보유
                  </CompareItem>
                  <CompareItem tone="text-signal-green" icon="up">
                    새로운 관점·벤치마크 도입 가능
                  </CompareItem>
                  <CompareItem tone="text-signal-red" icon="down">
                    사내 맥락·네트워크 이해 부족
                  </CompareItem>
                </ul>
              </div>
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-3.5">
                <div className="text-[11px] font-semibold text-brand-500">
                  현직자(앵커)
                </div>
                <div className="mt-0.5 text-[14px] font-bold text-ink-900">
                  {anchor.name}
                </div>
                <div className="text-[11.5px] text-ink-500">
                  {anchor.grade} · {anchor.orgName}
                </div>
                <ul className="mt-2.5 space-y-1.5">
                  <CompareItem tone="text-brand-700" icon="up">
                    조직 맥락·내부 신뢰 기반 확보
                  </CompareItem>
                  <CompareItem tone="text-brand-700" icon="up">
                    즉시 실행 가능한 사내 네트워크
                  </CompareItem>
                  <CompareItem tone="text-ink-400" icon="down">
                    외부 시장 관점·신규 채널 경험 제한
                  </CompareItem>
                </ul>
              </div>
            </div>
            <p className="mt-2.5 text-[11.5px] text-ink-400">
              외부 영입 시 현직자와의 역할 분담·보완 관계를 함께 검토하세요.
            </p>
          </div>
        )}

        {/* 비즈니스 시나리오 */}
        <div className="card p-4">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink-900">
            <IconSpark className="h-4 w-4 text-brand-700" /> 채용 비즈니스 시나리오
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-2 text-[12px] font-bold text-signal-green">
                기대 기여
              </div>
              <ul className="space-y-2">
                {scenario.contribution.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12.5px] text-ink-700"
                  >
                    <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 text-[12px] font-bold text-signal-amber">
                리스크
              </div>
              <ul className="space-y-2">
                {scenario.risks.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12.5px] text-ink-700"
                  >
                    <IconWarn className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-amber" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-canvas px-3.5 py-2.5">
              <div className="text-[11px] font-semibold text-ink-400">
                예상 적응 기간
              </div>
              <div className="mt-0.5 text-[13px] font-bold text-ink-900">
                {scenario.adaptPeriod}
              </div>
            </div>
            <div className="rounded-xl bg-brand-50 px-3.5 py-2.5">
              <div className="text-[11px] font-semibold text-brand-500">
                권장 액션
              </div>
              <div className="mt-0.5 text-[13px] font-bold text-brand-700">
                {scenario.recommendation}
              </div>
            </div>
          </div>
        </div>

        {/* 다른 포스트 추천 */}
        <div className="card p-4">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink-900">
            <IconStar className="h-4 w-4 text-signal-amber" /> 다른 포스트 적합도
            <span className="text-[11px] font-normal text-ink-400">
              클릭 시 검토 포스트 변경
            </span>
          </div>
          <div className="space-y-1.5">
            {otherFits.map((o) => (
              <button
                key={o.key}
                onClick={() => reassign(o.key)}
                className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left transition hover:border-brand-200 hover:bg-brand-50"
              >
                <span className="w-9 text-right text-[15px] font-bold text-ink-900">
                  {o.score}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${o.score}%`,
                      background: fitColor(o.score),
                    }}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-ink-900">
                    {o.key}
                  </span>
                  <span className="text-[11px] text-ink-400">{o.group}</span>
                </span>
                <IconArrowRight className="h-4 w-4 shrink-0 text-ink-300" />
              </button>
            ))}
          </div>
        </div>

        {/* 채용 진행 상태 */}
        <div className="card p-4">
          <div className="mb-3 text-[13px] font-bold text-ink-900">
            채용 진행 상태
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
            placeholder="진행 메모 (예: 1차 인터뷰 일정 조율 중, 처우 협의 필요 등)"
            className="input mt-3 min-h-[64px] resize-none"
          />
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-[12px] font-medium text-ink-400 transition hover:text-signal-red"
            >
              <IconTrash className="h-4 w-4" /> 후보 삭제
            </button>
            <div className="flex items-center gap-2">
              {saved && (
                <span className="text-[12px] font-medium text-signal-green">
                  저장되었습니다
                </span>
              )}
              <button onClick={onSaveStatus} className="btn-primary">
                상태 저장
                <IconArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <p className="pb-2 text-center text-[11px] text-ink-400">
          본 매칭·시나리오는 참고·검토용입니다. 업로드 원문은 파싱 후 보관하지
          않습니다(시연 기준). 최종 채용결정은 별도 절차를 따릅니다.
        </p>
      </div>
    </>
  );
}

function CompareItem({
  tone,
  icon,
  children,
}: {
  tone: string;
  icon: "up" | "down";
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-1.5 text-[12px] text-ink-700">
      <span className={cn("mt-0.5 shrink-0 font-bold", tone)}>
        {icon === "up" ? "▲" : "▽"}
      </span>
      {children}
    </li>
  );
}
