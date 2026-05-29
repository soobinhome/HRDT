import {
  CandidateInternal,
  MatchResult,
  MetricKey,
  METRIC_KEYS,
  ScoredCandidate,
  TaskProfile,
  Verdict,
} from "./types";

// 정성 지표 → 점수 (0~100 스케일)
const METRIC_SCORE: Record<string, number> = {
  "◎": 100,
  "○": 72,
  "△": 42,
  X: 12,
  "-": 35, // 데이터 부족(중립)
};

export function metricToScore(m: string): number {
  return METRIC_SCORE[m] ?? 35;
}

const GRADE_READINESS: Record<string, number> = {
  대리급: 4,
  과장급: 12,
  차장급: 10,
  부장급: 6,
  임원: 0,
};

const EVAL_BONUS: Record<string, number> = {
  HP: 22,
  SP: 14,
  IP: 0,
  A: 6,
  C: -8,
  "-": 0,
};

function verdictOf(score: number): Verdict {
  if (score >= 60) return "즉시 검토";
  if (score >= 45) return "육성 후보";
  return "후순위/보류";
}

// ──────────────────────────────────────────────
// scoreTalent V8.0
//  현직자 앵커 25 / 포스트 특수성 20 / 핵심역량 20
//  DISC 13 / 강점 12 / 즉시성 10
// ──────────────────────────────────────────────
export function scoreTalentV8(
  emp: CandidateInternal,
  prof: TaskProfile,
  pool: CandidateInternal[]
): MatchResult {
  const reasons: string[] = [];
  const risks: string[] = [];

  // 1) 현직자 앵커 유사도 (25%) — 6차원 코사인 유사도
  const anchor = prof.anchor
    ? pool.find((e) => e.name === prof.anchor)
    : undefined;
  let anchorSim = 55;
  let anchorDiff: MatchResult["anchorDiff"] | undefined;
  if (anchor) {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    const betterAt: MetricKey[] = [];
    const weakerAt: MetricKey[] = [];
    METRIC_KEYS.forEach((k) => {
      const a = metricToScore(anchor.metrics[k]);
      const b = metricToScore(emp.metrics[k]);
      dot += a * b;
      magA += a * a;
      magB += b * b;
      if (b - a >= 25) betterAt.push(k);
      else if (a - b >= 25) weakerAt.push(k);
    });
    const cos = magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
    // 현직자보다 선호 DISC가 강하면 보너스 (보완 유형 탐지)
    const discBonus =
      emp.discScores[prof.discPrefer] > anchor.discScores[prof.discPrefer]
        ? 8
        : 0;
    anchorSim = Math.min(100, Math.round(cos * 100 + discBonus));
    const complementStrengths = emp.strengths.filter(
      (s) => s && s !== "-" && !anchor.strengths.includes(s)
    );
    anchorDiff = { betterAt, weakerAt, complementStrengths };
    if (anchorSim >= 80)
      reasons.push(`현직자(${anchor.name}) 역량 프로필과 ${anchorSim}% 일치`);
    if (betterAt.length)
      reasons.push(`현직자 대비 ${betterAt.join("·")} 항목이 우수`);
  }

  // 2) 포스트 특수성: 필수 직무 부합도 (20%)
  const must = prof.mustJob ?? [];
  const jobHits = must.filter((mj) =>
    emp.job.some((jt) => jt.includes(mj) || mj.includes(jt))
  );
  const postFit =
    must.length > 0 ? Math.round((jobHits.length / must.length) * 100) : 60;
  const noJobMatch = must.length > 0 && jobHits.length === 0;
  if (jobHits.length) reasons.push(`필수 직무경험 부합: ${jobHits.join(", ")}`);
  if (noJobMatch) risks.push(`포스트 필수 직군(${must.join("/")}) 경험 미확인`);

  // 3) 핵심 역량 가중 점수 (20%)
  let capWeighted = 0;
  let capWeightSum = 0;
  (Object.entries(prof.competencyWeights) as [MetricKey, number][]).forEach(
    ([k, w]) => {
      capWeighted += metricToScore(emp.metrics[k]) * w;
      capWeightSum += w;
    }
  );
  const capability = capWeightSum
    ? Math.round(capWeighted / capWeightSum)
    : 50;
  const topComp = (
    Object.entries(prof.competencyWeights) as [MetricKey, number][]
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k)
    .filter((k) => ["◎", "○"].includes(emp.metrics[k]));
  if (topComp.length)
    reasons.push(`핵심 역량 ${topComp.join("·")} 보유`);

  // 4) DISC 적합도 (13%)
  const discRaw = emp.discScores[prof.discPrefer] || 0;
  const discFit = Math.min(100, Math.round(discRaw * 7));
  if (emp.disc === prof.discPrefer)
    reasons.push(`과업 선호 DISC(${prof.discPrefer}) 유형 일치`);

  // 5) 강점 매칭 (12%)
  const mustHit = prof.strengthMust.filter((s) => emp.strengths.includes(s));
  const preferHit = prof.strengthPrefer.filter((s) =>
    emp.strengths.includes(s)
  );
  const allMust =
    prof.strengthMust.length > 0 && mustHit.length === prof.strengthMust.length;
  const strengthFit = Math.min(
    100,
    mustHit.length * 30 + preferHit.length * 12 + (allMust ? 16 : 0)
  );
  if (mustHit.length) reasons.push(`필수 강점 일치: ${mustHit.join("·")}`);
  if (prof.strengthMust.length && mustHit.length === 0)
    risks.push(`과업 필수 강점(${prof.strengthMust.join("/")}) 미보유`);

  // 6) 즉시성 (10%)
  const readiness = Math.min(
    100,
    Math.max(
      0,
      32 +
        (EVAL_BONUS[emp.avgEval] ?? 0) +
        (emp.ebgPass === "O" ? 18 : emp.ebgPass === "일부" ? 8 : 0) +
        (emp.managerClass ? 10 : 0) +
        (GRADE_READINESS[emp.gradeGroup] ?? 0)
    )
  );
  if (emp.ebgPass === "O") reasons.push("EBG 통과 경험 보유 (즉시 투입 가능)");
  if (emp.avgEval === "HP" || emp.avgEval === "SP")
    reasons.push(`최근 3개년 평가 우수(${emp.avgEval})`);
  if (emp.ebgPass === "X") risks.push("EBG 미통과 — 검증 단계 필요");
  if (emp.avgEval === "-") risks.push("평가 데이터 부족 (-5점 보정)");

  // ── 최종 합산 ──
  let total =
    anchorSim * 0.25 +
    postFit * 0.2 +
    capability * 0.2 +
    discFit * 0.13 +
    strengthFit * 0.12 +
    readiness * 0.1;

  if (emp.gradeGroup === "임원") total -= 12;
  if (emp.avgEval === "-") total -= 5;
  if (noJobMatch) total -= 17.5; // hardPenalty 35 * 0.5

  total = Math.max(0, Math.min(98, Math.round(total)));

  return {
    candidateId: emp.id,
    totalScore: total,
    anchorSimilarity: anchorSim,
    postFit,
    capability,
    discFit,
    strengthFit,
    readiness,
    verdict: verdictOf(total),
    reasons: reasons.slice(0, 5),
    risks: risks.slice(0, 4),
    anchorDiff,
  };
}

// 과업 기준 후보 랭킹 (현직자·임원 제외, 상위 N)
export function rankCandidates(
  prof: TaskProfile,
  pool: CandidateInternal[],
  opts: { limit?: number; excludeName?: string } = {}
): ScoredCandidate[] {
  const { limit = 6, excludeName } = opts;
  return pool
    .filter((e) => e.gradeGroup !== "임원")
    .filter((e) => (excludeName ? e.name !== excludeName : true))
    .map((e) => ({ ...e, match: scoreTalentV8(e, prof, pool) }))
    .sort((a, b) => b.match.totalScore - a.match.totalScore)
    .slice(0, limit);
}

// 외부 인재용 간이 적합도 (파싱 키워드 기반)
export function scoreExternalFit(
  fitKeywords: string[],
  skills: string[],
  prof: TaskProfile
): number {
  const hay = [...fitKeywords, ...skills].join(" ").toLowerCase();
  const jobHit = prof.mustJob.filter((j) =>
    hay.includes(j.toLowerCase())
  ).length;
  const tagPool = [...prof.strengthMust, ...prof.strengthPrefer, prof.group];
  const tagHit = tagPool.filter((t) =>
    hay.includes(String(t).toLowerCase())
  ).length;
  const base = 48;
  const score =
    base +
    (prof.mustJob.length ? (jobHit / prof.mustJob.length) * 34 : 18) +
    Math.min(18, tagHit * 6);
  return Math.max(0, Math.min(96, Math.round(score)));
}
