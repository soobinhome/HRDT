import { CandidateExternal } from "../types";

// ⚠️ 전원 가상 인물 / 시연용 샘플입니다.
export const SAMPLE_EXTERNAL: CandidateExternal[] = [
  {
    id: "ext-1",
    name: "정유빈",
    company: "라이프스타일커머스",
    grade: "부장 / 14년차",
    jobField: "온라인, 이커머스, 그로스",
    careerSummary:
      "이커머스 3사에서 온라인 사업·그로스 총괄. GMV 연 1,200억 규모 플랫폼 운영, 신규 채널 0→1 런칭 다수 경험.",
    achievements:
      "재직 중 GMV 38% 성장, 신규 O2O 채널 런칭 6개월 만에 월 매출 22억 달성.",
    parsedSkills: ["이커머스", "퍼포먼스마케팅", "그로스", "데이터분석", "O2O"],
    fitKeywords: ["온라인", "이커머스", "O2O", "그로스", "마케팅"],
    status: "심층면접",
    assignedTaskKey: "온라인·O2O 성장",
    fitScore: 81,
    disc: "I",
    mbti: "ENTJ",
    strengths: ["미래지향", "발상", "행동"],
    createdAt: "2026-05-21",
    sourceFile: "정유빈_이력서.pdf",
  },
  {
    id: "ext-2",
    name: "한도경",
    company: "테크커머스랩",
    grade: "차장 / 11년차",
    jobField: "AI, 데이터, 디지털전환",
    careerSummary:
      "AI/ML 기반 추천·자동화 시스템 구축 리드. 리테일 데이터 파이프라인 설계 및 수요예측 모델 운영.",
    achievements:
      "수요예측 정확도 +17%p 개선으로 재고비용 연 40억 절감, 운영 자동화로 처리시간 60% 단축.",
    parsedSkills: ["AI", "머신러닝", "데이터엔지니어링", "Python", "MLOps"],
    fitKeywords: ["AI", "데이터", "디지털", "자동화", "ML"],
    status: "최종후보",
    assignedTaskKey: "전 직무 AI 대전환",
    fitScore: 86,
    disc: "C",
    mbti: "INTJ",
    strengths: ["분석", "미래지향", "배움"],
    createdAt: "2026-05-18",
    sourceFile: "한도경_리멤버.pdf",
  },
  {
    id: "ext-3",
    name: "백서진",
    company: "글로벌패션그룹",
    grade: "부장 / 16년차",
    jobField: "MD, 상품기획, 소싱",
    careerSummary:
      "글로벌 SPA 브랜드 MD 총괄. 시즌 상품 기획부터 글로벌 소싱·원가 협상까지 전 과정 리드.",
    achievements:
      "통합 소싱 체계 구축으로 원가율 4.2%p 개선, 베스트셀러 적중률 시즌 평균 31% 달성.",
    parsedSkills: ["MD", "상품기획", "글로벌소싱", "원가관리", "바잉"],
    fitKeywords: ["MD", "상품", "소싱", "의류", "구매"],
    status: "1차검토",
    assignedTaskKey: "통합 MDP(소싱)",
    fitScore: 78,
    disc: "S",
    mbti: "ISTJ",
    strengths: ["책임", "집중", "수집"],
    createdAt: "2026-05-26",
    sourceFile: "백서진_경력기술서.pdf",
  },
  {
    id: "ext-4",
    name: "오재희",
    company: "스타트업HR솔루션",
    grade: "이사 / 18년차",
    jobField: "HR, 인재개발, 조직설계",
    careerSummary:
      "성장기 스타트업 CHO. 채용 시스템·역량 모델·승계 계획을 0부터 설계하고 1,000명 규모로 확장 운영.",
    achievements:
      "핵심인재 리텐션 +21%p, 채용 리드타임 45→24일 단축, 사내 육성 프로그램 자체 구축.",
    parsedSkills: ["HR", "채용", "조직설계", "HRD", "승계계획"],
    fitKeywords: ["HR", "인사", "채용", "조직설계", "CHO"],
    status: "보류",
    assignedTaskKey: "A인재 확보·배치",
    fitScore: 74,
    disc: "D",
    mbti: "ENTJ",
    strengths: ["전략", "개인화", "의사소통"],
    createdAt: "2026-05-12",
    sourceFile: "오재희_프로필.pdf",
  },
];

// 업로드 시연용 샘플 이력서 텍스트 (PDF 텍스트 추출 결과 가정)
export const DEMO_RESUME_TEXT = `[경력기술서]
성명: 강민서
현직장: 넥스트리테일 (이커머스 플랫폼)
직급/연차: 부장 / 13년차
직무: 온라인 사업기획, 이커머스 그로스, O2O 운영

[주요 경력]
- 넥스트리테일 온라인사업본부 그로스팀장 (2019~현재): 신규 O2O 채널 런칭 및 운영 총괄
- 커머스파트너스 마케팅실 (2015~2019): 퍼포먼스 마케팅, CRM
- 리테일컴퍼니 영업기획 (2012~2015): 오프라인 매장 운영 기획

[핵심 성과]
- 온라인 GMV 연 35% 성장 견인, 신규 멤버십 200만 확보
- O2O 픽업 서비스 도입으로 객단가 18% 상승
- 데이터 기반 추천 도입 후 전환율 2.4%p 개선

[보유 역량/스킬]
이커머스, 그로스해킹, 퍼포먼스마케팅, 데이터분석, O2O, CRM`;
