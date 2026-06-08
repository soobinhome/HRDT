// ──────────────────────────────────────────────
// 공통 타입 정의 (PRD 5-3 기반, scoreTalent V8.0 정합)
// ──────────────────────────────────────────────

export type Metric = "◎" | "○" | "△" | "X" | "-";
export type DiscType = "D" | "I" | "S" | "C";
export type EvalGrade = "HP" | "SP" | "IP" | "A" | "C" | "-";
export type OX = "O" | "X" | "일부";

export const METRIC_KEYS = [
  "열정",
  "집요함",
  "전략",
  "시스템사고",
  "팀워크",
  "리더십",
] as const;
export type MetricKey = (typeof METRIC_KEYS)[number];

// ── 포스트 매트릭스 ───────────────────────────
export type PostColor = "red" | "yellow" | "blue" | "green" | "empty";
export type PostType = "current" | "successor" | "wing";

export interface PostCell {
  title?: string;
  person?: string;
  grade?: string;
  age?: number;
  color: PostColor;
  taskKey?: string; // 연결된 과업 프로파일 키
  memo?: string;
}

export interface PostRow {
  id: string;
  area: string;
  level?: string; // 조직 레벨 표기 (예: "LV6") — 있으면 조직명 아래 표시
  current: PostCell;
  successors: PostCell[]; // 2개 (F2)
  wings: PostCell[]; // 5개 날개과업
}

// ── 컴스타일 (Action·Process·People·Idea) ────
export interface ComStyle {
  AC: number; // Action   — 실행·추진
  PR: number; // Process  — 체계·관리
  PE: number; // People   — 관계·조화
  ID: number; // Idea     — 창의·혁신
}

// ── 이탈 위험 신호 유형 ────────────────────────
export type AttritionRisk = "평가하락" | "승진적체" | "없음";

// ── 학교 티어 분류 ─────────────────────────────
export type SchoolTier = "3개대" | "7개대" | "12개대" | "25개대" | "지방국립대" | "기타대";

// ── 내부 인재 ─────────────────────────────────
export interface CandidateInternal {
  id: string;
  name: string;

  // 기본 정보
  orgGroup: string;   // 조직구분 (유통BG, 의류BG 등)
  orgName: string;    // 조직명
  grade: string;      // 레벨직위명 (예: 과장)
  gradeGroup: string; // 사원급/대리급/과장급/차장급/부장급/임원
  workLocation: string; // 본사/현장 구분
  lastPromotion: string; // 최종 승진 시점 (예: "2023-03-01")
  gradeYears: number;   // 현 직위 체류년수

  // 레거시 (기존 호환)
  age: number;

  // 역량 프로파일
  lang: number;   // 언어 1~10
  math: number;   // 수리 1~10
  metrics: Record<MetricKey, Metric>; // 열정·집요함·전략·시스템사고·팀워크·리더십
  comStyle: ComStyle; // 컴스타일 AC·PR·PE·ID
  disc: DiscType;
  discScores: { D: number; I: number; S: number; C: number };
  mbti: string;
  strengths: string[]; // 갤럽 강점 최대 5개

  // 직무 & 평가
  job: string[];        // 직무 태그
  avgEval: EvalGrade;  // 3개년 평균종합평가
  ebgPass: OX;
  managerClass: boolean; // 경영자반
  sproutClass: boolean;  // 새싹반
  groundExp: boolean;    // 밑바닥경험

  // 학교 정보
  school?: string;
  major?: string;
  schoolTier?: SchoolTier;

  // 추가 정보
  emoney?: number;      // E머니 배수
  status?: string;      // 재직자 / 휴직자

  // 이탈 위험 (자동 계산)
  attritionRisk?: AttritionRisk;
}

// ── 과업 프로파일 (taskProfiles V8.0) ─────────
export interface TaskProfile {
  key: string;
  label: string;
  group: string;
  desc: string;
  anchor?: string; // 현직자 앵커 (이름)
  mustJob: string[]; // 필수 직군 (미부합 시 패널티)
  competencyWeights: Partial<Record<MetricKey, number>>;
  discPrefer: DiscType;
  strengthMust: string[];
  strengthPrefer: string[];
  minYears?: number; // Phase 2 placeholder
}

// ── 판별 결과 ─────────────────────────────────
export type Verdict = "즉시 검토" | "육성 후보" | "후순위/보류";

export interface AnchorDiff {
  betterAt: MetricKey[];
  weakerAt: MetricKey[];
  complementStrengths: string[]; // 현직자에게 없는 보완 강점
}

export interface MatchResult {
  candidateId: string;
  totalScore: number;
  anchorSimilarity: number; // 25%
  postFit: number; // 20%
  capability: number; // 20%
  discFit: number; // 13%
  strengthFit: number; // 12%
  readiness: number; // 10%
  verdict: Verdict;
  reasons: string[];
  risks: string[];
  anchorDiff?: AnchorDiff;
}

export type ScoredCandidate = CandidateInternal & { match: MatchResult };

// ── 발령 검토 상태 (PRD 6-3) ──────────────────
export type ReviewStatus =
  | "추천됨"
  | "검토중"
  | "추가확인"
  | "인터뷰"
  | "발령후보"
  | "발령승인"
  | "발령보류"
  | "발령제외";

export interface ReviewRecord {
  candidateId: string;
  taskKey: string;
  status: ReviewStatus;
  memo: string;
  updatedAt: string;
}

// ── 외부 인재 파이프라인 ──────────────────────
export type ExternalStatus =
  | "1차검토"
  | "심층면접"
  | "최종후보"
  | "채용결정"
  | "보류";

export interface CandidateExternal {
  id: string;
  name: string;
  company: string;
  grade: string; // 직급 / 연차
  jobField: string;
  careerSummary: string;
  achievements: string;
  parsedSkills: string[];
  fitKeywords: string[];
  status: ExternalStatus;
  assignedTaskKey?: string;
  fitScore?: number;
  disc?: DiscType;
  mbti?: string;
  strengths?: string[];
  createdAt: string;
  sourceFile?: string;
}

// AI 파싱 결과 (확인/수정 전 raw)
export interface ParsedResume {
  name: string;
  company: string;
  grade: string;
  jobField: string;
  careerSummary: string;
  achievements: string;
  skills: string[];
  fitKeywords: string[];
}
