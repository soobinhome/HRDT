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

// ── 학교 티어 분류 ─────────────────────────────
export const SCHOOL_TIER_MAP: Record<string, string> = {
  "서울대": "3개대",  "연세대": "3개대",  "고려대": "3개대",
  "서강대": "7개대",  "성균관대": "7개대", "성균관대(수원)": "7개대",
  "한양대": "7개대",  "중앙대": "7개대",
  "경희대(수원)": "12개대", "경희대": "12개대", "건국대": "12개대",
  "서울시립대": "12개대",  "한국외대": "12개대", "이화여대": "12개대",
  "홍익대": "25개대",  "동국대": "25개대",  "국민대": "25개대",
  "명지대": "25개대",  "인하대": "25개대",  "아주대": "25개대",
  "서울과기대": "25개대", "서울과학기술대": "25개대", "숭실대": "25개대",
  "가톨릭대": "25개대", "연세대(원주)": "25개대", "세종대": "25개대",
  "단국대": "25개대",  "숙명여대": "25개대",
  "부산대": "지방국립대", "경북대": "지방국립대", "충남대": "지방국립대",
  "충북대": "지방국립대", "전남대": "지방국립대", "전북대": "지방국립대",
};

export function getSchoolTier(school: string | undefined): string {
  if (!school) return "";
  return SCHOOL_TIER_MAP[school] ?? "기타대";
}

// ── 성과 유형 판별 ─────────────────────────────
export type PerformanceType = "고성과형" | "프로세스형" | "전략형" | "사람형" | "개척형";

const M_RANK: Record<string, number> = { "◎": 4, "○": 3, "△": 2, "X": 1, "-": 0 };

function metricGte(val: string): boolean {
  return (M_RANK[val] ?? 0) >= 3;
}

function comDom(
  cs: CandidateInternal["comStyle"] | undefined,
  ...keys: Array<"AC" | "PR" | "PE" | "ID">
): boolean {
  if (!cs) return false;
  const max = Math.max(cs.AC, cs.PR, cs.PE, cs.ID);
  if (max === 0) return false;
  return keys.some((k) => cs[k] === max);
}

function comBoth(
  cs: CandidateInternal["comStyle"] | undefined,
  k1: "AC" | "PR" | "PE" | "ID",
  k2: "AC" | "PR" | "PE" | "ID",
): boolean {
  if (!cs) return false;
  const max = Math.max(cs.AC, cs.PR, cs.PE, cs.ID);
  return max > 0 && cs[k1] >= max * 0.6 && cs[k2] >= max * 0.6;
}

// CSV에서 일부 강점명 약칭 허용 (예: 최상화 = 최상주의자)
const STR_ALIASES: Record<string, string[]> = {
  "최상주의자": ["최상주의자", "최상화"],
  "성취욕":     ["성취욕", "성취"],
};

function hasStr(strengths: string[], list: string[]): boolean {
  return list.some((s) => {
    const variants = STR_ALIASES[s] ?? [s];
    return variants.some((a) => strengths.includes(a));
  });
}

export function classifyPerformanceType(
  emp: CandidateInternal
): PerformanceType | null {
  const { mbti = "", disc, strengths = [], metrics, comStyle, lang = 0, math = 0 } = emp;
  const m = metrics;

  // 전략형 (우선 판별 — 기준 가장 엄격)
  if (
    hasStr(strengths, ["전략", "발상", "미래지향"]) &&
    comDom(comStyle, "ID") &&
    mbti.length >= 4 && mbti[1] === "N" && mbti[2] === "T" &&
    (disc === "D" || disc === "I") &&
    metricGte(m["열정"]) && metricGte(m["전략"]) && metricGte(m["리더십"]) &&
    (lang + math) / 2 >= 7
  ) return "전략형";

  // 고성과형 (AC와 PE 동반 필수)
  if (
    hasStr(strengths, ["성취", "최상주의자", "승부", "집중", "책임", "행동", "존재감"]) &&
    comBoth(comStyle, "AC", "PE") &&
    mbti.length >= 4 && mbti[0] === "E" && mbti[2] === "T" &&
    (disc === "D" || disc === "I") &&
    metricGte(m["열정"]) && metricGte(m["전략"]) && metricGte(m["리더십"])
  ) return "고성과형";

  // 프로세스형
  if (
    hasStr(strengths, ["분석", "체계", "심사숙고", "복구", "정리", "집중", "회고"]) &&
    comDom(comStyle, "PR") &&
    mbti.length >= 4 && mbti[1] === "S" && mbti[2] === "T" && mbti[3] === "J" &&
    (disc === "C" || disc === "S") &&
    metricGte(m["집요함"]) && metricGte(m["시스템사고"]) && metricGte(m["리더십"])
  ) return "프로세스형";

  // 개척형
  if (
    hasStr(strengths, ["발상", "미래지향", "자기확신", "사교성", "적응", "수집"]) &&
    comDom(comStyle, "ID", "PR") &&
    mbti.length >= 4 && mbti[1] === "N" && mbti[3] === "P" &&
    (disc === "D" || disc === "I")
  ) return "개척형";

  // 사람형
  if (
    hasStr(strengths, ["개발", "절친", "사교성", "개별화", "매력", "공감", "화합", "긍정"]) &&
    comDom(comStyle, "PE", "PR") &&
    disc === "I"
  ) return "사람형";

  return null;
}

// ── 성과 유형 판정 근거 ──────────────────────────
export interface PerformanceTypeBasis {
  matchedStrengths: string[];
  comStyleBasis: string | null;
  comStyleScore: number | null;
  mbtiBasis: string[];
  discBasis: string;
  discScore: number;
}

export function getPerformanceTypeBasis(
  emp: CandidateInternal,
  ptype: PerformanceType,
): PerformanceTypeBasis {
  const { mbti = "", disc, discScores, strengths = [], comStyle } = emp;

  const COM_LABEL: Record<string, string> = {
    AC: "AC(분석·논리)", PR: "PR(표현·관계)", PE: "PE(안정·공감)", ID: "ID(주도·결정)",
  };
  const DISC_LABEL: Record<string, string> = {
    D: "D형·주도형", I: "I형·사교형", S: "S형·안정형", C: "C형·신중형",
  };

  let comDomKey: string | null = null;
  let comDomScore: number | null = null;
  if (comStyle) {
    const max = Math.max(comStyle.AC, comStyle.PR, comStyle.PE, comStyle.ID);
    const entry = (Object.entries(comStyle) as [string, number][]).find(([, v]) => v === max);
    if (entry && max > 0) { comDomKey = entry[0]; comDomScore = entry[1]; }
  }

  const strMatch = (targets: string[]) =>
    strengths.filter(s => targets.some(t => s.includes(t) || t.includes(s)));

  let matchedStrengths: string[] = [];
  const mbtiBasis: string[] = [];

  if (ptype === "고성과형") {
    matchedStrengths = strMatch(["성취욕","성취","최상주의자","최상화","승부","집중","책임","행동","존재감","경쟁","자기확신"]);
    if (mbti[0] === "E") mbtiBasis.push("외향(E)");
    if (mbti[2] === "T") mbtiBasis.push("사고(T)");
    if (mbti[3] === "J") mbtiBasis.push("계획(J)");
  } else if (ptype === "프로세스형") {
    matchedStrengths = strMatch(["분석","체계","심사숙고","복구","정리","집중","회고","공정성","신중","책임"]);
    if (mbti[1] === "S") mbtiBasis.push("현실(S)");
    if (mbti[2] === "T") mbtiBasis.push("논리(T)");
    if (mbti[3] === "J") mbtiBasis.push("계획(J)");
  } else if (ptype === "전략형") {
    matchedStrengths = strMatch(["전략","발상","미래지향","지적사고","수집","맥락","배움","분석"]);
    if (mbti[1] === "N") mbtiBasis.push("직관(N)");
    if (mbti[2] === "T") mbtiBasis.push("논리(T)");
  } else if (ptype === "개척형") {
    matchedStrengths = strMatch(["발상","미래지향","자기확신","사교성","적응","수집","행동"]);
    if (mbti[1] === "N") mbtiBasis.push("직관(N)");
    if (mbti[3] === "P") mbtiBasis.push("유연(P)");
    if (mbti[0] === "E") mbtiBasis.push("외향(E)");
  } else if (ptype === "사람형") {
    matchedStrengths = strMatch(["개발","절친","사교성","개별화","매력","공감","화합","긍정"]);
    if (mbti[2] === "F") mbtiBasis.push("감정(F)");
    if (mbti[0] === "E") mbtiBasis.push("외향(E)");
  }

  return {
    matchedStrengths,
    comStyleBasis: comDomKey ? COM_LABEL[comDomKey] : null,
    comStyleScore: comDomScore,
    mbtiBasis,
    discBasis: DISC_LABEL[disc] ?? disc,
    discScore: discScores[disc] ?? 0,
  };
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
