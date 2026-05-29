import { PostCell, PostColor, PostRow } from "../types";

// ⚠️ 전원 가상 인물 / 시연용 샘플 매트릭스입니다.

function c(
  title: string,
  person: string,
  color: PostColor,
  taskKey?: string
): PostCell {
  return { title, person, color, taskKey };
}

const EMPTY: PostCell = { title: "", person: "", color: "empty" };

export const SAMPLE_MATRIX: PostRow[] = [
  {
    id: "row-distbg",
    area: "유통BG",
    level: "LV6",
    current: c("BG 총괄", "권태오(이사대우/46)", "yellow", "A인재 확보·배치"),
    successors: [
      c("", "-", "red"),
      c("", "-", "red"),
    ],
    wings: [
      c("SA급 컨텐츠", "남도경(부장/44)", "yellow", "SA급 컨텐츠"),
      c("의류 포트폴리오", "문가영(부장/37)", "yellow", "의류 상품 총괄"),
      c("K마살 모델 완성", "배준영(차장/43)", "yellow", "K마살 모델 완성"),
      c("A인재 판바꾸기", "한지우(차장/40)", "yellow", "A인재 확보·배치"),
      c("측정 노출", "정민결(차장/36)", "yellow", "핵심KPI 측정노출 자동화"),
    ],
  },
  {
    id: "row-ho",
    area: "HO",
    current: c("인사 총괄", "한지우(차장/40)", "yellow", "A인재 확보·배치"),
    successors: [
      c("", "-", "red"),
      c("F2", "하지원(과장/36)", "yellow", "A인재 확보·배치"),
    ],
    wings: [
      c("A확보 배치", "서민재(과장/37)", "yellow", "A확보 배치"),
      c("의류 정예화", "백승호(과장/38)", "yellow", "의류 정예화"),
      c("인적자산 양성·부채제로", "임채린(과장/36)", "yellow", "인적자산 양성부채제로"),
      c("E머니 5대 동기부여(유지)", "", "red", "E머니 5대 동기부여(유지)"),
      c("돈되는 자기주도학습(개발)", "", "red", "돈되는 자기주도학습(개발)"),
    ],
  },
  {
    id: "row-fo",
    area: "FO",
    current: c("재무 총괄", "윤태경(부장/45)", "red", "재무 손익 총괄"),
    successors: [
      c("", "-", "red"),
      c("F2", "강수련(차장/41)", "yellow", "재무 손익 총괄"),
    ],
    wings: [
      c("판관비 15%", "임도현(과장/36)", "yellow", "판관비 15%"),
      c("역수익틀 7%", "민도현(차장/42)", "yellow", "역수익틀 7%"),
      c("재무리스크 헷징", "", "red", "재무리스크 헷징"),
      c("자금 관련", "강수련(차장/41)", "yellow", "자금 관련"),
      c("부동산 자산증식", "조민기(차장/43)", "yellow", "부동산 자산증식"),
    ],
  },
  {
    id: "row-so",
    area: "SO",
    current: c("전략 총괄", "정민결(차장/36)", "yellow", "전략·측정 총괄"),
    successors: [
      c("", "-", "red"),
      c("F2", "진서윤(과장/37)", "yellow", "전략·측정 총괄"),
    ],
    wings: [
      c("핵심KPI 측정노출 자동화", "진서윤(과장/37)", "yellow", "핵심KPI 측정노출 자동화"),
      c("전직원 EBG 측정노출", "김도윤(주임/28)", "red", "전직원 EBG 측정노출"),
      c("전직원 E머니측정노출", "장하윤(과장/35)", "yellow", "전직원 E머니측정노출"),
      EMPTY,
      EMPTY,
    ],
  },
  {
    id: "row-apparel",
    area: "의류",
    current: c("의류 총괄", "문가영(부장/37)", "yellow", "의류 상품 총괄"),
    successors: [
      c("", "-", "red"),
      c("", "-", "red"),
    ],
    wings: [
      c("요즘 남성 + 성인SPA", "류지안(과장/32)", "yellow", "요즘 남성 + 성인SPA"),
      c("키즈 차별화+아동SPA", "손예나(과장/35)", "red", "키즈 차별화+아동SPA"),
      c("통합 MDP(소싱)", "오세영(과장/39)", "yellow", "통합 MDP(소싱)"),
      c("A급 디자이너", "배소현(부장/48)", "red", "A급 디자이너"),
      c("", "-", "red"),
    ],
  },
  {
    id: "row-special",
    area: "특정",
    current: c("특정 총괄", "남도경(부장/44)", "yellow", "특정 컨텐츠 총괄"),
    successors: [
      c("", "-", "red"),
      c("F2", "김병하(과장/38)", "blue", "특정 컨텐츠 총괄"),
    ],
    wings: [
      c("여성", "고은성(과장/39)", "yellow", "특정 컨텐츠 총괄"),
      c("스포츠/남성", "", "red", "특정 컨텐츠 총괄"),
      c("F&B", "전하늘(과장/41)", "red", "F&B"),
      c("라이프스타일(리징)", "우송이(과장/40)", "blue", "라이프스타일(리징)"),
      c("차별화트렌드(잡화)", "김병하(과장/38)", "blue", "차별화트렌드(잡화)"),
    ],
  },
  {
    id: "row-opr",
    area: "OPR",
    current: c("OPR 총괄", "황재선(부장/43)", "yellow", "OPR 상품·운영 총괄"),
    successors: [
      c("", "-", "red"),
      c("", "-", "red"),
    ],
    wings: [
      c("여성 상품 해결", "", "red", "OPR 상품·운영 총괄"),
      c("잡화 상품 해결", "지연후(차장/45)", "red", "OPR 상품·운영 총괄"),
      c("물류 블록체인 해결", "차예준(차장/41)", "yellow", "물류 블록체인 해결"),
      c("OPR 전략 EBG 실행", "임창규(차장/40)", "yellow", "OPR 전략 EBG 실행"),
      c("AI 대전환", "", "red", "OPR AI 대전환"),
    ],
  },
  {
    id: "row-online",
    area: "온라인",
    current: c("온라인 총괄", "구본혁(과장/38)", "yellow", "온라인·O2O 성장"),
    successors: [
      c("", "-", "red"),
      c("", "-", "red"),
    ],
    wings: [
      c("의류 온라인 혁신", "김준형(과장/34)", "yellow", "의류 온라인 혁신"),
      c("특정 O2O 혁신", "김영선(과장/38)", "red", "특정 O2O 혁신"),
      c("온라인/AI 자동화 혁신", "신유라(과장/34)", "yellow", "온라인·AI 자동화 혁신"),
      EMPTY,
      EMPTY,
    ],
  },
  {
    id: "row-ai",
    area: "AI",
    current: c("AI 총괄", "문태일(차장/41)", "red", "전 직무 AI 대전환"),
    successors: [
      c("", "-", "red"),
      c("F2", "오동하(대리/33)", "yellow", "전 직무 AI 대전환(추진)"),
    ],
    wings: [
      c("전 직무 AI 대전환", "오동하(대리/33)", "yellow", "전 직무 AI 대전환(추진)"),
      c("의류 AI 대전환", "오한별(과장/35)", "red", "의류 AI 대전환"),
      c("OPR AI 대전환", "한결(대리/33)", "yellow", "OPR AI 대전환"),
      EMPTY,
      EMPTY,
    ],
  },
];

// 매트릭스 → 평탄화 셀 목록 (KPI 집계용)
export function allCells(matrix: PostRow[]): PostCell[] {
  return matrix.flatMap((r) => [r.current, ...r.successors, ...r.wings]);
}

export function isFilledCell(cell: PostCell): boolean {
  return cell.color !== "empty" && Boolean(cell.title || cell.person);
}

export interface MatrixKPI {
  total: number;
  red: number;
  yellow: number;
  blue: number;
  green: number;
}

export function computeKPI(matrix: PostRow[]): MatrixKPI {
  const cells = allCells(matrix).filter(isFilledCell);
  const kpi: MatrixKPI = {
    total: cells.length,
    red: 0,
    yellow: 0,
    blue: 0,
    green: 0,
  };
  cells.forEach((c) => {
    if (c.color === "red") kpi.red++;
    else if (c.color === "yellow") kpi.yellow++;
    else if (c.color === "blue") kpi.blue++;
    else if (c.color === "green") kpi.green++;
  });
  return kpi;
}

export const COLOR_LABEL: Record<PostColor, string> = {
  red: "빨간불",
  yellow: "노란불",
  blue: "파란불",
  green: "초록불",
  empty: "빈칸",
};

export const COLOR_MEANING: Record<PostColor, string> = {
  red: "즉시 교체·검증 필요",
  yellow: "지켜보기",
  blue: "EBG 통과",
  green: "안정",
  empty: "미배치",
};
