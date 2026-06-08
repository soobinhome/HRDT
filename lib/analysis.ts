import { CandidateInternal } from "./types";

// ── 확장 5유형 ──────────────────────────────────
export type ExtendedType = "고성과형" | "프로세스형" | "사람형" | "전략형" | "개척형";

const GRADE_ORDER: Record<string, number> = {
  임원: 6, 부장급: 5, 차장급: 4, 과장급: 3, 대리급: 2, 사원급: 1,
};

export const EXT_TYPE_META: Record<ExtendedType, {
  chip: string;
  definition: string;
  workStrengths: string[];
  collabRisks: string[];
  goodBossTypes: string[];
  goodSubTypes: string[];
  warnCombinations: string[];
  managementTips: string[];
}> = {
  고성과형: {
    chip: "bg-signal-greenBg text-signal-green",
    definition: "성과·목표·추진·경쟁·영향력·빠른 실행에 강한 유형",
    workStrengths: [
      "목표 달성과 성과 압박 대응",
      "빠른 실행으로 어려운 과제 돌파",
      "조직 내 영향력 발휘와 분위기 견인",
    ],
    collabRisks: [
      "빠른 속도로 주변 피로도가 높아질 가능성",
      "디테일과 운영 안정성을 놓칠 수 있음",
      "피드백이 직설적으로 전달될 수 있음",
    ],
    goodBossTypes: ["전략형", "고성과형"],
    goodSubTypes: ["프로세스형", "고성과형", "전략형"],
    warnCombinations: [
      "과도하게 통제하는 상사 — 실행 욕구 억제 위험",
      "의사결정이 느린 상사 — 속도 갈등 가능",
      "관계만 중시하고 기준이 약한 상사",
    ],
    managementTips: [
      "방향과 목표는 명확히 주고 실행 방식은 위임",
      "성과 기준을 수치로 사전 합의",
      "빠른 피드백 루프 유지 (주 1회 이상)",
    ],
  },
  프로세스형: {
    chip: "bg-signal-blueBg text-signal-blue",
    definition: "체계·기준·안정화·운영 개선·리스크 관리에 강한 유형",
    workStrengths: [
      "기준 수립과 운영 안정화",
      "리스크 관리와 매뉴얼화",
      "품질 관리와 반복 업무 효율화",
    ],
    collabRisks: [
      "의사결정이 느려질 수 있음",
      "변화가 잦은 환경에서 피로를 느낄 가능성",
      "세부 기준에 집중하다 큰 그림을 놓칠 수 있음",
    ],
    goodBossTypes: ["전략형", "고성과형"],
    goodSubTypes: ["고성과형", "개척형", "사람형"],
    warnCombinations: [
      "말이 자주 바뀌는 상사 — 기준 혼란 위험",
      "즉흥형 상사 — 안정성 저하",
      "방향만 던지고 기준을 주지 않는 상사",
    ],
    managementTips: [
      "업무 기준과 우선순위를 사전에 명확히 제시",
      "변화 시 충분한 사전 공유와 맥락 설명",
      "검토 시간을 계획에 반영",
    ],
  },
  사람형: {
    chip: "bg-signal-amberBg text-signal-amber",
    definition: "관계·공감·육성·협업·조직 분위기에 강한 유형",
    workStrengths: [
      "관계 형성과 조직 분위기 관리",
      "온보딩·후배 육성·갈등 완화",
      "협업 촉진과 현장 수용성 확보",
    ],
    collabRisks: [
      "갈등 회피로 피드백이 늦어질 수 있음",
      "성과 압박 상황에서 기준이 약해질 가능성",
      "관계를 고려하다 의사결정이 느려질 수 있음",
    ],
    goodBossTypes: ["전략형", "사람형"],
    goodSubTypes: ["고성과형", "개척형"],
    warnCombinations: [
      "직설적 압박이 강한 상사 — 위축 가능성",
      "관심 없이 방치하는 상사 — 방치감 위험",
      "성과만 말하고 감정 맥락을 무시하는 상사",
    ],
    managementTips: [
      "관심과 맥락 설명을 병행",
      "정서적으로 안전한 피드백 방식 사용",
      "코칭형 1:1 미팅 정례화",
    ],
  },
  전략형: {
    chip: "bg-brand-50 text-brand-700",
    definition: "큰 그림·문제 정의·구조화·방향 설정에 강한 유형",
    workStrengths: [
      "문제 정의와 중장기 전략 수립",
      "복잡한 문제 구조화와 대안 도출",
      "신사업·조직개편·브랜드 전략",
    ],
    collabRisks: [
      "실행 디테일이 약해질 수 있음",
      "반복 운영 업무에서 몰입이 낮아질 가능성",
      "너무 개념적으로 전달될 수 있음",
    ],
    goodBossTypes: ["전략형", "고성과형"],
    goodSubTypes: ["고성과형", "프로세스형", "사람형"],
    warnCombinations: [
      "반복 운영만 지시하는 상사 — 몰입 저하",
      "단기 성과만 압박하는 상사",
      "디테일만 지적하고 방향 논의를 안 하는 상사",
    ],
    managementTips: [
      "목표와 의사결정 기준을 명확히 주되 방식은 위임",
      "전략을 구체 과제로 번역하는 브리핑 프로세스 필요",
      "생각할 공간과 시간 보장",
    ],
  },
  개척형: {
    chip: "bg-signal-redBg text-signal-red",
    definition: "새로운 것·외부 발굴·신사업·신규 채널·불확실한 과제에 강한 유형",
    workStrengths: [
      "신규 기회 발굴과 외부 네트워크 구축",
      "변화 추진과 불확실한 문제 돌파",
      "신사업·신규 채널 개척",
    ],
    collabRisks: [
      "운영 안정성이 떨어질 수 있음",
      "세부 관리가 약할 수 있음",
      "기존 절차와 충돌할 가능성",
    ],
    goodBossTypes: ["전략형", "고성과형"],
    goodSubTypes: ["프로세스형", "사람형", "고성과형"],
    warnCombinations: [
      "절차를 과도하게 요구하는 상사 — 실행 욕구 억제",
      "리스크만 보는 상사 — 추진력 저하",
      "작은 실수까지 통제하는 상사",
    ],
    managementTips: [
      "큰 방향과 권한을 위임",
      "실패 허용 범위를 사전에 합의",
      "운영 파트너(프로세스형)와 페어링 권장",
    ],
  },
};

// ── 유형 점수 계산 ───────────────────────────────
export interface TypeSignal {
  type: ExtendedType;
  score: number;
  signals: string[];
}

export function getComDom(cs: CandidateInternal["comStyle"] | undefined): string | null {
  if (!cs) return null;
  const max = Math.max(cs.AC, cs.PR, cs.PE, cs.ID);
  if (max === 0) return null;
  if (cs.ID === max) return "ID";
  if (cs.AC === max) return "AC";
  if (cs.PR === max) return "PR";
  return "PE";
}

export function scorePersonalTypes(emp: CandidateInternal): TypeSignal[] {
  const { mbti = "", disc, discScores, strengths = [], comStyle } = emp;
  const comDom = getComDom(comStyle);

  function strHit(targets: string[]): string[] {
    return strengths.filter(s => targets.some(t => s.includes(t) || t.includes(s)));
  }

  const calc: [ExtendedType, () => { score: number; signals: string[] }][] = [
    ["고성과형", () => {
      let sc = 0; const sig: string[] = [];
      if (disc === "D") { sc += 20; sig.push("DISC D(주도형)"); }
      else if (discScores.D >= 9) { sc += 12; sig.push(`DISC D 높음(${discScores.D}점)`); }
      if (discScores.I >= 9) { sc += 5; sig.push("DISC I 보조"); }
      if (comDom === "ID") { sc += 15; sig.push("컴스타일 ID(주도·결정)"); }
      else if (comDom === "PR") { sc += 7; }
      if (mbti[0] === "E") { sc += 8; sig.push("MBTI E(외향)"); }
      if (mbti[2] === "T") { sc += 8; sig.push("MBTI T(사고)"); }
      if (mbti[3] === "J") { sc += 5; sig.push("MBTI J(계획)"); }
      const hits = strHit(["성취욕","성취","경쟁","최상주의자","최상화","자기확신","행동","책임","주도력","커뮤니케이션","집중","존재감","승부"]);
      sc += Math.min(18, hits.length * 6);
      if (hits.length) sig.push(`강점: ${hits.join("·")}`);
      return { score: Math.min(100, sc), signals: sig };
    }],
    ["프로세스형", () => {
      let sc = 0; const sig: string[] = [];
      if (disc === "C") { sc += 20; sig.push("DISC C(신중형)"); }
      else if (discScores.C >= 9) { sc += 12; sig.push(`DISC C 높음(${discScores.C}점)`); }
      if (disc === "S" || discScores.S >= 8) { sc += 8; sig.push("DISC S(안정형) 보조"); }
      if (comDom === "AC") { sc += 15; sig.push("컴스타일 AC(분석·논리)"); }
      else if (comDom === "PE") { sc += 8; sig.push("컴스타일 PE(안정·공감)"); }
      if (mbti[1] === "S") { sc += 10; sig.push("MBTI S(현실)"); }
      if (mbti[3] === "J") { sc += 10; sig.push("MBTI J(계획·구조)"); }
      if (mbti[2] === "T") { sc += 6; sig.push("MBTI T(논리)"); }
      const hits = strHit(["정리","분석","심사숙고","책임","공정성","체계","신중","복구","집중","회고"]);
      sc += Math.min(18, hits.length * 6);
      if (hits.length) sig.push(`강점: ${hits.join("·")}`);
      return { score: Math.min(100, sc), signals: sig };
    }],
    ["사람형", () => {
      let sc = 0; const sig: string[] = [];
      if (disc === "I" || disc === "S") { sc += 18; sig.push(`DISC ${disc}형(관계·안정)`); }
      else if (discScores.I >= 8 || discScores.S >= 8) { sc += 8; sig.push("DISC I/S 높음"); }
      if (comDom === "PR") { sc += 15; sig.push("컴스타일 PR(표현·관계)"); }
      else if (comDom === "PE") { sc += 12; sig.push("컴스타일 PE(안정·공감)"); }
      if (mbti[2] === "F") { sc += 15; sig.push("MBTI F(감정·관계)"); }
      if (mbti[0] === "E") { sc += 8; sig.push("MBTI E(외향)"); }
      const hits = strHit(["공감","화합","개별화","개발","긍정","연결성","포용","절친","적응","사교성"]);
      sc += Math.min(18, hits.length * 6);
      if (hits.length) sig.push(`강점: ${hits.join("·")}`);
      return { score: Math.min(100, sc), signals: sig };
    }],
    ["전략형", () => {
      let sc = 0; const sig: string[] = [];
      if (disc === "D" || disc === "C") { sc += 12; sig.push(`DISC ${disc}형(방향·분석)`); }
      if (comDom === "ID") { sc += 15; sig.push("컴스타일 ID(주도·변화)"); }
      else if (comDom === "AC") { sc += 12; sig.push("컴스타일 AC(분석·검토)"); }
      if (mbti[1] === "N") { sc += 18; sig.push("MBTI N(직관·전략적 사고)"); }
      if (mbti[2] === "T") { sc += 10; sig.push("MBTI T(논리·원칙)"); }
      const hits = strHit(["전략","분석","미래지향","발상","지적사고","수집","맥락","배움"]);
      sc += Math.min(21, hits.length * 7);
      if (hits.length) sig.push(`강점: ${hits.join("·")}`);
      return { score: Math.min(100, sc), signals: sig };
    }],
    ["개척형", () => {
      let sc = 0; const sig: string[] = [];
      if (discScores.D >= 8 && discScores.I >= 8) { sc += 20; sig.push("DISC D·I 모두 높음(개척·추진)"); }
      else if (disc === "D" || disc === "I") { sc += 10; sig.push(`DISC ${disc}형`); }
      if (comDom === "ID") { sc += 15; sig.push("컴스타일 ID(주도·아이디어)"); }
      else if (comDom === "PR") { sc += 7; }
      if (mbti[1] === "N") { sc += 10; sig.push("MBTI N(가능성·패턴)"); }
      if (mbti[3] === "P") { sc += 10; sig.push("MBTI P(유연·탐색)"); }
      if (mbti[0] === "E") { sc += 8; sig.push("MBTI E(외향·적극)"); }
      const hits = strHit(["발상","미래지향","전략","행동","사교성","커뮤니케이션","자기확신","적응","수집"]);
      sc += Math.min(18, hits.length * 6);
      if (hits.length) sig.push(`강점: ${hits.join("·")}`);
      return { score: Math.min(100, sc), signals: sig };
    }],
  ];

  return calc
    .map(([type, fn]) => ({ type, ...fn() }))
    .sort((a, b) => b.score - a.score);
}

export interface PersonalAnalysis {
  coreType: ExtendedType;
  coreScore: number;
  subTypes: ExtendedType[];
  typeScores: TypeSignal[];
}

export function analyzePersonal(emp: CandidateInternal): PersonalAnalysis {
  const scores = scorePersonalTypes(emp);
  const threshold = scores[0].score * 0.65;
  return {
    coreType: scores[0].type,
    coreScore: scores[0].score,
    subTypes: scores.slice(1, 3).filter(s => s.score >= threshold).map(s => s.type),
    typeScores: scores,
  };
}

// ── Fit 계산 ─────────────────────────────────────
export interface FitResult {
  totalScore: number;
  breakdown: {
    추진력: number;
    커뮤니케이션: number;
    안정성: number;
    보완성: number;
    리스크관리: number;
  };
  goodReasons: string[];
  conflictRisks: string[];
  bossNotes: string[];
  subNotes: string[];
  hrIntervention: "낮음" | "보통" | "높음";
  verdict: "즉시 추천" | "추천 가능" | "조건부 추천" | "별도 검토";
}

const COMP_TABLE: Partial<Record<ExtendedType, Partial<Record<ExtendedType, number>>>> = {
  전략형:    { 고성과형: 20, 프로세스형: 18, 사람형: 15, 개척형: 12, 전략형: 8 },
  고성과형:  { 프로세스형: 18, 전략형: 15, 사람형: 13, 고성과형: 10, 개척형: 12 },
  개척형:    { 프로세스형: 20, 사람형: 15, 고성과형: 15, 전략형: 12, 개척형: 7 },
  프로세스형: { 고성과형: 15, 개척형: 18, 사람형: 12, 전략형: 14, 프로세스형: 8 },
  사람형:    { 고성과형: 15, 개척형: 13, 전략형: 12, 프로세스형: 10, 사람형: 8 },
};

export function calcFit(boss: CandidateInternal, sub: CandidateInternal): FitResult {
  const bossA = analyzePersonal(boss);
  const subA  = analyzePersonal(sub);
  const good: string[] = [], conflict: string[] = [], bossNotes: string[] = [], subNotes: string[] = [];

  // 1. 업무 추진 Fit (max 25)
  let push = 12;
  if (boss.disc === "D" && sub.disc === "D") { push += 8; good.push("양쪽 모두 추진력 강해 실행 속도 맞음"); }
  if (boss.disc === "D" && sub.disc === "S") { push -= 8; conflict.push("상사의 빠른 추진이 부하에게 압박으로 느껴질 수 있음"); bossNotes.push("기한·기대결과를 명확히 제시"); }
  if (boss.disc === "C" && sub.disc === "D") { push -= 4; conflict.push("상사 신중 검토 vs 부하 실행 욕구 충돌 가능"); }
  if (boss.disc === "D" && sub.disc === "C") { push -= 3; bossNotes.push("속도와 검토 수준을 사전 합의"); }
  const pushScore = Math.max(0, Math.min(25, push));

  // 2. 커뮤니케이션 Fit (max 25)
  let comm = 12;
  if (boss.mbti?.[0] === sub.mbti?.[0]) { comm += 5; good.push(`외향/내향 성향 일치(${boss.mbti?.[0]})`); }
  if (boss.mbti?.[2] === sub.mbti?.[2]) comm += 6;
  if (boss.mbti?.[2] === "T" && sub.mbti?.[2] === "F") {
    comm -= 8; conflict.push("상사의 논리적 피드백이 부하에게 차갑게 느껴질 수 있음");
    bossNotes.push("피드백 시 사실→기대→지원 순서 활용");
  }
  const bCom = getComDom(boss.comStyle);
  const sCom = getComDom(sub.comStyle);
  if (bCom && sCom && bCom === sCom) comm += 4;
  if (bCom === "ID" && sCom === "AC") { comm -= 3; conflict.push("직관적 결정 vs 분석적 검토 속도 차이"); }
  const commScore = Math.max(0, Math.min(25, comm));

  // 3. 안정성 Fit (max 15)
  let stab = 7;
  const bJ = boss.mbti?.[3] === "J", sJ = sub.mbti?.[3] === "J";
  if (bJ && sJ) { stab += 8; good.push("양쪽 모두 계획·구조 지향으로 안정성 높음"); }
  if (bJ && !sJ) { stab -= 4; conflict.push("일정·마감 방식 갈등 가능성"); bossNotes.push("중간 마일스톤 설정 권장"); }
  if (!bJ && sJ) { stab -= 2; subNotes.push("상사의 유연한 방식 적응 지원 필요"); }
  if (!bJ && !sJ) { stab -= 3; conflict.push("계획성 부재로 운영 안정성 주의"); }
  const stabScore = Math.max(0, Math.min(15, stab));

  // 4. 보완성 Fit (max 20)
  const compScore = COMP_TABLE[bossA.coreType]?.[subA.coreType] ?? 10;
  if (compScore >= 18) good.push(`${bossA.coreType} 상사 + ${subA.coreType} 부하: 보완성 우수`);
  else if (compScore <= 8) conflict.push("유사 유형 과다 — 역할 중복 가능성");

  // 5. 리스크 관리 가능성 (max 15)
  let risk = 10;
  if (boss.disc === "D" && sub.disc === "S") { risk -= 4; bossNotes.push("부하의 속도 부담 인지, 격려 위주 피드백"); }
  if (boss.disc === "I" && sub.disc === "C") { risk -= 3; bossNotes.push("기준과 방향을 명확히 제시"); }
  if (bossA.coreType === "개척형" && (subA.coreType === "프로세스형" || sub.disc === "S")) {
    bossNotes.push("변화 이유와 안정장치를 함께 설명");
  }
  if (bossA.coreType === "고성과형" && subA.coreType === "사람형") {
    bossNotes.push("성과 기준 유지하되 관계적 피드백 병행");
  }
  const riskScore = Math.max(0, Math.min(15, risk));

  const total = Math.min(98, pushScore + commScore + stabScore + compScore + riskScore);
  if (!good.length) good.push("기본 업무 진행에 지장 없음");

  const hrIntervention: FitResult["hrIntervention"] =
    conflict.length >= 3 || total < 55 ? "높음" :
    conflict.length >= 1 || total < 70 ? "보통" : "낮음";

  const verdict: FitResult["verdict"] =
    total >= 75 ? "즉시 추천" :
    total >= 65 ? "추천 가능" :
    total >= 50 ? "조건부 추천" : "별도 검토";

  return {
    totalScore: total,
    breakdown: { 추진력: pushScore, 커뮤니케이션: commScore, 안정성: stabScore, 보완성: compScore, 리스크관리: riskScore },
    goodReasons: good,
    conflictRisks: conflict,
    bossNotes: bossNotes.length ? bossNotes : ["정기 1:1 미팅으로 기대 수준 공유"],
    subNotes: subNotes.length ? subNotes : ["목표와 피드백 루틴 유지"],
    hrIntervention,
    verdict,
  };
}

// ── 추천 ─────────────────────────────────────────
export interface RecommendedPerson {
  emp: CandidateInternal;
  fit: FitResult;
  coreType: ExtendedType;
}

export function recommendBosses(
  emp: CandidateInternal,
  pool: CandidateInternal[],
  limit = 5,
): RecommendedPerson[] {
  const myGrade = GRADE_ORDER[emp.gradeGroup] ?? 0;
  return pool
    .filter(e => e.id !== emp.id && (GRADE_ORDER[e.gradeGroup] ?? 0) > myGrade && e.status !== "휴직자")
    .map(e => ({ emp: e, fit: calcFit(e, emp), coreType: analyzePersonal(e).coreType }))
    .sort((a, b) => b.fit.totalScore - a.fit.totalScore)
    .slice(0, limit);
}

export function recommendSubordinates(
  emp: CandidateInternal,
  pool: CandidateInternal[],
  limit = 5,
): RecommendedPerson[] {
  const myGrade = GRADE_ORDER[emp.gradeGroup] ?? 0;
  return pool
    .filter(e => e.id !== emp.id && (GRADE_ORDER[e.gradeGroup] ?? 0) < myGrade && e.status !== "휴직자")
    .map(e => ({ emp: e, fit: calcFit(emp, e), coreType: analyzePersonal(e).coreType }))
    .sort((a, b) => b.fit.totalScore - a.fit.totalScore)
    .slice(0, limit);
}
