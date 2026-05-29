import { CandidateExternal, ParsedResume, TaskProfile } from "./types";

// ──────────────────────────────────────────────
// Mock AI 파싱 (Claude API 연동 전 시뮬레이션)
// 실제 연동 시 이 함수만 /api/parse 호출로 교체
// ──────────────────────────────────────────────

const SKILL_DICT: Record<string, string[]> = {
  이커머스: ["온라인", "이커머스", "커머스"],
  퍼포먼스마케팅: ["퍼포먼스", "마케팅", "광고", "crm"],
  그로스: ["그로스", "growth", "성장"],
  데이터분석: ["데이터", "분석", "bi", "지표"],
  O2O: ["o2o", "픽업", "옴니"],
  AI: ["ai", "인공지능", "ml", "머신러닝", "모델"],
  HR: ["hr", "인사", "채용", "조직", "cho", "hrd", "승계"],
  MD: ["md", "상품기획", "바잉", "소싱", "구매"],
  재무: ["재무", "손익", "자금", "회계", "리스크"],
  물류: ["물류", "scm", "공급망", "재고"],
  디자인: ["디자인", "브랜드", "크리에이티브"],
}

const FIELD_DICT: Record<string, string[]> = {
  "온라인/이커머스": ["이커머스", "온라인", "그로스", "o2o", "커머스"],
  "AI/데이터": ["ai", "데이터", "머신러닝", "ml", "디지털"],
  "HR/인재개발": ["hr", "인사", "채용", "조직", "cho", "hrd"],
  "상품/MD": ["md", "상품", "소싱", "바잉", "구매"],
  "재무/손익": ["재무", "손익", "자금", "회계"],
  "물류/운영": ["물류", "scm", "운영", "재고"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function extractLine(text: string, keys: string[]): string {
  const lines = text.split(/\n+/);
  for (const line of lines) {
    for (const k of keys) {
      if (line.includes(k)) {
        return line
          .replace(/^[\s\-•\[\]]+/, "")
          .replace(new RegExp(`.*${k}\\s*[:：]?`), "")
          .trim();
      }
    }
  }
  return "";
}

export function mockParseResume(text: string): ParsedResume {
  const lower = text.toLowerCase();

  const name =
    extractLine(text, ["성명", "이름"]).split(/[\s(]/)[0] ||
    `후보_${Math.floor(Math.random() * 900 + 100)}`;
  const company =
    extractLine(text, ["현직장", "회사", "직장"]).split("(")[0].trim() ||
    "(추출 필요)";
  const grade =
    extractLine(text, ["직급", "연차"]) || `${pick(["과장", "차장", "부장"])} / ${
      Math.floor(Math.random() * 10) + 8
    }년차`;

  const skills = Object.entries(SKILL_DICT)
    .filter(([, kws]) => kws.some((kw) => lower.includes(kw)))
    .map(([s]) => s);

  const jobField =
    Object.entries(FIELD_DICT)
      .filter(([, kws]) => kws.some((kw) => lower.includes(kw)))
      .map(([f]) => f)
      .join(", ") || "직무 분야 확인 필요";

  // 성과 라인 추출
  const achLines = text
    .split(/\n+/)
    .filter((l) => /\d+\s*(%|p|억|원|만|배)/.test(l))
    .map((l) => l.replace(/^[\s\-•]+/, "").trim());
  const achievements =
    achLines.slice(0, 2).join(" / ") || "정량 성과 추가 확인 필요";

  const careerLines = text
    .split(/\n+/)
    .filter((l) => /\d{4}/.test(l) && /[~\-]/.test(l))
    .slice(0, 3)
    .map((l) => l.replace(/^[\s\-•]+/, "").trim());
  const careerSummary =
    careerLines.join(" · ") ||
    text.split(/\n+/).find((l) => l.length > 20)?.trim() ||
    "경력 요약 확인 필요";

  const fitKeywords = Array.from(
    new Set(
      skills.flatMap((s) => SKILL_DICT[s]).filter((k) => /[가-힣]/.test(k))
    )
  ).slice(0, 6);

  return {
    name,
    company,
    grade,
    jobField,
    careerSummary,
    achievements,
    skills: skills.length ? skills : ["(스킬 추출 필요)"],
    fitKeywords: fitKeywords.length ? fitKeywords : skills,
  };
}

// 파싱 동작을 비동기처럼 (로딩 UX 시연)
export function parseResumeAsync(text: string, delay = 1400): Promise<ParsedResume> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockParseResume(text)), delay);
  });
}

// ──────────────────────────────────────────────
// 비즈니스 시나리오 생성 (채용 시 기여·리스크·적응기간)
// ──────────────────────────────────────────────
export interface BusinessScenario {
  contribution: string[];
  risks: string[];
  adaptPeriod: string;
  recommendation: string;
}

export function generateScenario(
  cand: Pick<CandidateExternal, "name" | "company" | "jobField" | "achievements">,
  prof: TaskProfile,
  fitScore: number
): BusinessScenario {
  const high = fitScore >= 78;
  const mid = fitScore >= 62;

  const contribution = [
    `${prof.group} 영역에서 ${cand.company}의 검증된 실행 경험을 즉시 이식`,
    high
      ? `'${prof.label}' 과업의 핵심 난제를 6개월 내 가시적 성과로 전환 가능`
      : `'${prof.label}' 과업의 일부 영역부터 단계적 기여 예상`,
    cand.achievements && cand.achievements.length > 6
      ? `정량 성과 이력(${cand.achievements.slice(0, 28)}…) 기반 빠른 수치 개선 기대`
      : "외부 관점의 프로세스 개선·벤치마크 도입 기대",
  ];

  const risks = [
    fitScore < 62
      ? "과업 핵심 요건 일부 미충족 — 온보딩 시 역량 보강 필요"
      : "외부 영입 공통 리스크: 사내 의사결정 문화 적응",
    "기존 내부 후보 대비 조직 네트워크·맥락 이해 부족",
    high ? "처우·직급 기대 수준 사전 합의 필요" : "장기 핏(fit) 추가 검증 권장",
  ];

  const adaptPeriod = high
    ? "약 2~3개월 (즉시 전력화 가능)"
    : mid
      ? "약 3~5개월 (온보딩·정렬 기간 필요)"
      : "약 5~6개월 이상 (역량·핏 보강 병행)";

  const recommendation = high
    ? "심층면접 후 최종후보 진행 권장"
    : mid
      ? "현직자 비교 후 추가 검증 진행"
      : "내부 후보 우선 검토 / 보류 후 재평가";

  return { contribution, risks, adaptPeriod, recommendation };
}
