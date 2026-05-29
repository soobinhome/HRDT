# HO 인재개발·포스트매칭 서비스 구현 PRD v1.0
# HR Talent Control Tower — Product Requirements Document

> 작성일: 2026-05-29 | 버전: v1.0 | 상태: 확정  
> 본 문서는 HO 인사실장 인터뷰 결과를 기반으로 작성된 개발 구현 PRD입니다.

---

## 서비스 포지셔닝

> McKinsey · Mercer 등 탑티어 HR 컨설팅펌이 수억~수십억 원 프로젝트로 납품하는  
> "조직 진단 + 승계 계획 + 인재 매칭" 솔루션을 SaaS 형태로 제공하는 B2B HR Tech 플랫폼

**단기 목표:** 내부 운영 도구  
**중기 목표:** 계열사/그룹사 확장  
**장기 목표:** 외부 B2B 판매

---

## 목차

1. [문서 목적 및 배경](#1-문서-목적-및-배경)
2. [기존 구현물 분석 및 처리 방향 확정](#2-기존-구현물-분석-및-처리-방향-확정)
3. [서비스 개요](#3-서비스-개요)
4. [핵심 기능 요구사항](#4-핵심-기능-요구사항)
5. [데이터 구조 정의](#5-데이터-구조-정의)
6. [화면 설계 기준](#6-화면-설계-기준)
7. [기술 스택 및 구현 방향](#7-기술-스택-및-구현-방향)
8. [버전 청사진 및 비즈니스 로드맵](#8-버전-청사진-및-비즈니스-로드맵)
9. [구현 일정 (Phase 1 기준)](#9-구현-일정-phase-1-기준)
10. [미확정 항목 \[추후확인\]](#10-미확정-항목-추후확인)
11. [Phase 1 완료 기준 체크리스트](#11-phase-1-완료-기준-체크리스트)

---

## 1. 문서 목적 및 배경

본 PRD는 HO 인사실장이 구상·일부 구현한 인재개발·포스트매칭 인사시스템을 실제 서비스로 구현하기 위한 개발 기준 문서다.

- **인터뷰 일시:** 2026-05-29
- **인터뷰 방식:** 구조화 인터뷰 (40분)
- **분석 대상:** `유통BG_인재_컨트롤타워_공유용_20260527.html`

---

## 2. 기존 구현물 분석 및 처리 방향 확정

첨부된 HTML 파일(981KB, 단일 파일 SPA)을 분석하여 보존/수정/폐기/재구현 대상을 분류하고 실장님 확인을 완료했다.

### 2-1. 구현물 처리 방향 확정표

| 구분 | 항목 | 현재 상태 | AI 1차 판단 | 최종 처리 |
|------|------|-----------|-------------|-----------|
| 화면 | 핵심포스트 노출판 (매트릭스 테이블) | 구현 | 보존 | **보존** |
| 화면 | 내부 후보 판별기 필터 UI | 구현 | 수정 | **수정** (후순위) |
| 화면 | 외부 인재 수기 입력 폼 | 구현 | 폐기 | **폐기** |
| 화면 | 채용 현황판 탭 | 미구현 | [추후확인] | **[추후확인]** |
| 로직 | scoreTalent V7.1 알고리즘 | 구현 | 재구현 | **재구현** |
| 로직 | 과업별 taskProfiles 가중치 정의 | 구현 | 수정 | **수정** (앵커 기반 추가) |
| 기능 | 외부 인재 PDF 업로드·파싱 | 미구현 | 재구현 | **재구현** |
| 기능 | 포스트 적합도 비교·시나리오 생성 | 미구현 | 재구현 | **재구현** |
| 데이터 | 로컬 HTML 저장 (localStorage) | 구현 | 폐기 | **폐기** |
| 데이터 | Supabase DB 저장 | 미구현 | 재구현 | **재구현** |
| 보안 | 실명 직원 데이터 HTML 내 포함 | 구현 | 폐기 | **폐기** (샘플→실데이터 분리) |

### 2-2. 보존 항목 상세: 핵심포스트 노출판

현재 HTML에서 그대로 유지할 핵심 구조:

- 9개 법인/사업부(유통BG, HO, FO, SO, 의류, 특정, OPR, 온라인, AI) × (현직자 1 + 후계자 2 + 날개과업 5) 매트릭스
- 빨간불/노란불/파란불 3단계 상태 색상 표시 (즉시교체 / 지켜보기 / EBG통과)
- 4개 KPI 요약 카드 (전체 포스트, 빨간불, 노란불, 파란불 수)
- 이름/직급/과업/영역 텍스트 검색 + 색상 필터
- 관리자 편집모드: 셀 클릭 → 내용·색상 수정
- 포스트 클릭 시 내부 후보 판별기 연결 (신규 연동 추가 필요)

---

## 3. 서비스 개요

### 3-1. 서비스 정의

**서비스명 (가칭):** HR Talent Control Tower

> 조직의 핵심 포스트 현황을 한눈에 파악하고, 각 포스트에 가장 적합한 내·외부 인재를 데이터 기반으로 자동 추천하여 인사 의사결정을 지원하는 B2B HR Intelligence 플랫폼

### 3-2. 핵심 사용자

| 역할 | 주요 사용 목적 | 권한 수준 (현재) |
|------|---------------|----------------|
| HO 인사실장 | 전체 포스트 관리, 후보 판별, 발령 검토 | 전체 관리자 |
| HRBP | 포스트별 후보 추천·검토, 데이터 입력 | 전체 관리자 (동일 수준) |
| 대표/경영진 (향후) | 요약 대시보드 조회, 후보 드릴다운 | 요약 뷰 (Phase 3) |
| 계열사 인사실장 (향후) | 계열사 포스트·후보 관리 | 테넌트 단위 (Phase 4) |

> Phase 1 기준. 권한 분리는 Phase 3에서 적용.

### 3-3. 핵심 문제 정의

- 포스트 현황이 HTML 파일에 고립되어 저장 불안정·버전 충돌 발생
- 내부 판별기 알고리즘이 포스트별 특수성을 반영하지 못하고 단순 정량 우수자만 추천
- 외부 인재 등록이 수기 방식으로 비효율·누락 발생
- 추천 결과가 단순 점수에 그치고 현직자 비교·비즈니스 시나리오가 없어 의사결정 미흡
- 보고/시연 시 저장 데이터 유실 반복

---

## 4. 핵심 기능 요구사항

### 4-1. 핵심포스트 노출판 (보존 + 연동 강화)

| 기능 ID | 기능명 | 설명 | 우선순위 |
|---------|--------|------|----------|
| F01 | 포스트 매트릭스 뷰 | 9개 영역 × 현직자·후계자·날개과업 테이블. 색상 신호등 표시 | P0 |
| F02 | 포스트 셀 클릭 → 후보 판별기 연결 | 셀 클릭 시 해당 과업 기준 내부 후보 판별기 자동 실행 | P0 |
| F03 | 포스트 데이터 DB 저장 | localStorage 제거, Supabase posts 테이블 저장·동기화 | P0 |
| F04 | 편집모드 권한 제어 | 관리자만 편집 가능, 일반 조회자 읽기 전용 | P1 |
| F05 | 포스트 현황 KPI 자동 집계 | 빨간불/노란불/파란불 수 실시간 집계 | P0 |

### 4-2. 내부 후보 판별기 (알고리즘 재구현)

**재구현 방향:** 현직자 앵커 기반(B안) + 포스트별 요건 직접 설정(A안) 혼합.  
Phase 1은 B안 우선 적용, Phase 2에서 A안 추가.

#### 신규 scoreTalent V8.0 가중치 구조 (재설계)

```
■ 현직자 앵커 유사도 (B안, Phase 1 핵심)                     25%
  - 현직자와의 DISC/강점/역량 벡터 유사도 (코사인 유사도)
  - 단, 현직자 복제가 아닌 "보완 유형" 탐지 옵션 포함

■ 포스트별 필수 경험 부합도 (A안, 직접 설정)                 20%
  - 해당 직무 재직 년수, 발령 이력, 프로젝트 경험
  - Phase 1: taskProfiles 수동 설정 / Phase 2: SAP 연동

■ 핵심 역량 가중치 점수 (기존 유지·보강)                     20%
  - 열정/집요함/전략/시스템사고/팀워크/리더십 (◎○△X 정량화)

■ DISC 과업 적합도                                           13%
■ 강점 매칭 (갤럽 StrengthsFinder)                          12%
■ 즉시성 점수 (직급·평가·EBG·교육 이력)                     10%

※ 언/수 점수·MBTI: 필터 조건으로 분리, 점수 가중치 제외
※ 임원 패널티(-12점), 데이터 부족 패널티(-5점) 유지
※ 최종 점수 범위: 0~100점
   60점 이상 = 즉시검토 / 45~59 = 육성후보 / 45미만 = 후순위
```

#### 판별 결과 카드 필수 표시 항목

| 표시 항목 | 내용 | 비고 |
|-----------|------|------|
| 종합 적합도 점수 | 0~100점 + 등급 (즉시검토/육성후보/후순위) | 원형 진행률로 표시 |
| 현직자 대비 비교 | 현직자와의 차이 항목 + 보완 강점 표시 | **신규 추가** |
| 포스트 특수성 부합도 | 해당 포스트 필수 경험 충족 여부 | **신규 추가** |
| 5차원 레이더 차트 | 역량·DISC·강점·즉시성·직무부합 | 기존 유지 |
| 판별 근거 텍스트 | 키워드 매칭·강점 일치·경험 부합 사유 | 기존 유지·보강 |
| 리스크 노트 | 필수 경험 미충족·역량 부족·EBG 미통과 등 | 기존 유지 |

### 4-3. 외부 인재 파이프라인 (전면 재구현)

| 기능 ID | 기능명 | 설명 | 우선순위 |
|---------|--------|------|----------|
| F10 | PDF/파일 업로드 | 지원서 PDF·리멤버 프로필 PDF 업로드 (drag & drop) | P0 |
| F11 | AI 자동 파싱 | Claude API로 이름·직장·직무·경력·주요성과 자동 구조화 | P0 |
| F12 | 파싱 결과 확인·수정 | AI 파싱 결과 사용자가 수정 후 확인 저장 | P0 |
| F13 | 지원 포스트 적합도 계산 | 지원한 포스트 기준 적합도 점수 자동 산출 | P0 |
| F14 | 타 포스트 적합도 추천 | 지원 포스트 외 적합한 포스트 자동 추천 | P0 |
| F15 | 현직자 비교 분석 | 해당 포스트 현직자와의 강약점 비교표 | P1 |
| F16 | 비즈니스 시나리오 생성 | 채용 시 예상 기여·리스크·적응기간 시나리오 | P1 |
| F17 | 인적성 데이터 2단계 입력 | DISC·MBTI·강점 추가 입력 시 정밀 매칭 업그레이드 | P2 |
| F18 | 상태 관리 | 1차검토→심층면접→최종후보→채용결정→보류 상태 전환 | P1 |

#### AI 파싱 대상 추출 필드

```
이름 / 현직장명 / 직급·연차 / 직무 분야
주요 경력 요약 (최근 3개 직장, 각 역할·성과 키워드)
핵심 성과 수치 (가능한 경우: 매출·증가율·절감액 등)
보유 기술·자격 / 학력 / 언어

→ 구조화 후 Candidate 테이블 저장
→ 인적성 데이터는 2단계에서 추가
```

---

## 5. 데이터 구조 정의

### 5-1. 핵심 엔티티

| 테이블 | 주요 컬럼 | 설명 |
|--------|-----------|------|
| `posts` | id, area, type(current/successor/wing), title, person, grade, age, color, status | 포스트 매트릭스 데이터. 기존 HTML SHARE_MATRIX 구조 마이그레이션 |
| `candidates_internal` | id, name, grade, org_name, lang, math, 열정/집요함/전략/시스템사고/팀워크/리더십, disc, mbti, strengths, avg_eval, ebg_pass, manager_class, sprout_class | 내부 직원 판별기 데이터. SAP 엑셀 추출 후 업로드 |
| `candidates_external` | id, name, company, grade, job_field, career_summary, parsed_skills, status, assigned_task, fit_score, created_at | 외부 인재 파이프라인. PDF 파싱 결과 저장 |
| `match_results` | id, candidate_id, post_id, total_score, anchor_similarity, post_fit, capability, disc_fit, strength_fit, readiness, verdict, reasons, risks, created_at | 판별기 계산 결과 저장 (히스토리 포함) |
| `post_requirements` | id, post_id, required_experience, min_years, key_competencies, disc_preferred, strength_preferred, direct_settings (JSON) | 포스트별 요건 직접 설정 (Phase 2 전환, Phase 1은 taskProfiles로 대체) |
| `review_history` | id, candidate_id, post_id, action, memo, reviewer, created_at | 후보 검토 이력 (발령 검토 상태 변경 로그) |

### 5-2. 내부 직원 데이터 최소 컬럼 (SAP 추출 기준)

#### MVP 필수 컬럼 (Phase 1)

```
이름 / 레벨직위명(직급) / 조직명
언(언어점수) / 수(수리점수)
열정 / 집요함 / 전략 / 시스템사고 / 팀워크 / 리더십  (◎○△X)
DISC (D/I/S/C 수치) / MBTI / 컴스타일
갤럽강점 (최대 5개)
3개년 평균평가 / EBG통과경험 / 경영자반 / 새싹반 / ESI
```

#### Phase 2 추가 컬럼

```
직무별 재직년수 / 발령이력 (날짜·직무)
성과등급 히스토리 / 프로젝트경험 키워드 / 밑바닥경험 여부
```

> **주의사항**
> - 1,000명+ 데이터: 엑셀 1파일 업로드 → Supabase 일괄 insert. 성능 문제 없음.
> - 민감정보(평가·성과) 외부 시연 시 샘플/익명 데이터로 대체 필수.

### 5-3. 타입 정의 (TypeScript)

```typescript
type Post = {
  id: string;
  area: string;
  type: "current" | "successor" | "wing";
  title: string;
  person: string;
  grade: string;
  color: "red" | "yellow" | "blue" | "green" | "empty";
  status: "filled" | "vacant" | "expected_vacancy" | "succession_needed" | "under_review";
  createdAt: string;
  updatedAt: string;
};

type CandidateInternal = {
  id: string;
  name: string;
  grade: string;
  orgName: string;
  gradeGroup: string;
  lang: number;       // 1~10
  math: number;       // 1~10
  metrics: {
    열정: "◎" | "○" | "△" | "X" | "-";
    집요함: "◎" | "○" | "△" | "X" | "-";
    전략: "◎" | "○" | "△" | "X" | "-";
    시스템사고: "◎" | "○" | "△" | "X" | "-";
    팀워크: "◎" | "○" | "△" | "X" | "-";
    리더십: "◎" | "○" | "△" | "X" | "-";
  };
  disc: "D" | "I" | "S" | "C";
  discScores: { D: number; I: number; S: number; C: number };
  mbti: string;
  strengths: string[];    // 갤럽 강점 최대 5개
  avgEval: "HP" | "SP" | "IP" | "A" | "C";
  ebgPass: "O" | "X" | "일부";
  managerClass: "O" | "X";
  sproutClass: "O" | "X";
  job: string[];          // 직무 태그 (추론)
};

type CandidateExternal = {
  id: string;
  name: string;
  company: string;
  grade: string;
  jobField: string;
  careerSummary: string;
  achievements: string;
  parsedSkills: string[];
  status: "1차검토" | "심층면접" | "최종후보" | "채용결정" | "보류";
  assignedTask?: string;
  fitScore?: number;
  disc?: string;
  mbti?: string;
  strengths?: string[];
  createdAt: string;
};

type MatchResult = {
  id: string;
  candidateId: string;
  postId: string;
  totalScore: number;
  anchorSimilarity: number;   // 현직자 앵커 유사도 25%
  postFit: number;            // 포스트 특수성 부합도 20%
  capability: number;         // 핵심 역량 20%
  discFit: number;            // DISC 적합도 13%
  strengthFit: number;        // 강점 매칭 12%
  readiness: number;          // 즉시성 10%
  verdict: "즉시 검토" | "육성 후보" | "후순위/보류";
  reasons: string[];
  risks: string[];
  createdAt: string;
};
```

---

## 6. 화면 설계 기준

### 6-1. UI/UX 원칙

| 원칙 | 기준 |
|------|------|
| 전반 톤 | 기업용 HR SaaS. 토스 UI(간결·정보위계) + Workday(안정·신뢰) 혼합 |
| 색상 | 흰색/회색 베이스. 포인트 컬러 파란색(#1E40AF) 1개. 상태색 최소화 (빨강/노랑/파랑 신호등만) |
| 이모지 | 원칙적 미사용. 아이콘은 텍스트 레이블과 병기 |
| 레이아웃 | 테이블·카드·필터·상세 패널 중심. 경영진이 1분 내 핵심 현황 파악 가능한 구조 |
| 제안서 캡처 | 어떤 화면도 캡처 즉시 제안서 삽입 가능 수준의 완성도 유지 |
| 반응형 | 1280px 이상 데스크탑 기준. 모바일 미대응 (내부 업무 도구 성격) |

### 6-2. 화면 흐름

```
[대시보드]
  → 포스트 매트릭스 (핵심포스트 노출판)
     → 포스트 셀 클릭
        → [내부 후보 판별기] 해당 과업 기준 자동 실행
           → 후보 카드 클릭 → 상세 패널 (레이더차트·비교·리스크)
              → 발령 검토 상태 변경 + 메모 저장

[외부 인재 파이프라인]
  → PDF 업로드 → AI 파싱 → 파싱 결과 확인
     → 포스트 적합도 자동 계산
        → 현직자 비교 + 비즈니스 시나리오 확인
           → 상태 관리 (1차검토/심층면접/최종후보 등)
```

### 6-3. 발령 검토 상태 흐름

```
추천됨 → 검토중 → 추가확인 필요 → 인터뷰/면담 → 발령후보 → 발령승인
                                                           ↘ 발령보류
                                                           ↘ 발령제외
```

---

## 7. 기술 스택 및 구현 방향

### 7-1. 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS | 서버컴포넌트·라우팅·타입안전성·스타일 효율 |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage) | DB·인증·파일저장 통합. HTML 로컬저장 완전 대체 |
| AI 파싱 | Claude API (`claude-sonnet-4-20250514`) | PDF 텍스트 → 구조화 JSON 파싱 + 포스트 적합도 분석 |
| 배포 | Vercel | 무중단 배포. 사내망 전환 전 테스트 환경 역할 |
| 파일 저장 | Supabase Storage | 업로드 PDF 임시 저장 (파싱 완료 후 삭제 또는 암호화 보관) |
| 상태관리 | Zustand | 전역 포스트·후보 상태 관리 |

### 7-2. Supabase 테이블 목록

```
posts
candidates_internal
candidates_external
match_results
post_requirements
review_history
users
organizations
demo_scenarios
```

### 7-3. 보안 및 개인정보 원칙

- **Phase 1:** 사내망 사용 전제. 외부 공개 URL에는 실제 인사정보 미노출.
- 외부 시연·고객 테스트 시 샘플/익명 데이터 전용 모드 제공.
- 실제 직원명·사번·평가등급·민감 메모는 관리자 권한 계정만 조회 가능.
- 추천 결과는 "참고/검토용" 문구 표시 필수. 최종 인사결정으로 오해 방지.
- PDF 업로드 파일: 파싱 완료 후 서버에서 삭제 또는 AES-256 암호화 보관.
- 접속 로그·수정 이력·추천 결과 생성 이력: **Phase 3에서 구현.**

### 7-4. Claude API 파싱 프롬프트 구조 (예시)

```typescript
const parsePrompt = `
다음은 외부 인재의 이력서/프로필 텍스트입니다.
아래 JSON 형식으로만 응답하세요. 다른 설명 없이 JSON만 출력하세요.

{
  "name": "이름",
  "company": "현직장",
  "grade": "직급 / 연차",
  "jobField": "직무 분야 (쉼표 구분)",
  "careerSummary": "주요 경력 3줄 요약",
  "achievements": "핵심 성과 수치 포함 2줄",
  "skills": ["기술1", "기술2"],
  "fitKeywords": ["포스트 매칭용 키워드1", "키워드2"]
}

이력서 내용:
${resumeText}
`;
```

---

## 8. 버전 청사진 및 비즈니스 로드맵

### V1.0 — 내부 운영 MVP

**목표:** 인사실장·HRBP가 포스트 현황 파악 및 내·외부 후보 추천을 자동화된 방식으로 수행

**포함 기능:**
- 핵심포스트 노출판 (매트릭스, 신호등, 편집, DB 저장)
- 내부 후보 판별기 V8.0 (현직자 앵커 + 포스트 특수성 반영)
- 외부 인재 PDF 업로드 → AI 자동 파싱
- 포스트 적합도 자동 계산 + 현직자 비교
- 발령 검토 상태 관리 (추천→검토중→최종후보→결정)
- 비즈니스 시나리오 기초 생성

**가격 방향:** 내부 운영 단계 (무료 or 그룹사 단위 라이선스)

---

### V2.0 — 데이터 연동 + 시나리오 고도화

**목표:** 실제 HR 데이터와 연동하여 판별 정확도를 높이고, 경영진 의사결정 지원 리포트를 자동 생성

**포함 기능:**
- SAP 발령 이력·직무 재직년수 자동 연동
- 성과 등급 히스토리 반영 판별기 고도화
- 비즈니스 시나리오 정량·정성 자동 생성 (AI)
- 포스트별 요건 직접 설정 UI (A안 완성)
- 승계 계획 관리 모듈
- 인재 육성 로드맵 추천
- 경영진 요약 대시보드 + 후보 드릴다운 뷰

**가격 방향:** 계열사 확장 라이선스 도입 (그룹사 단위 연간 구독)

---

### V3.0 — B2B SaaS 외부 판매

**목표:** 타사 HR 담당자가 자사 조직에 동일한 시스템을 도입하고 운영할 수 있는 완전한 B2B 플랫폼

**포함 기능:**
- 회사별 독립 테넌트 구조 (데이터 완전 분리)
- 온보딩 마법사 (조직 구조·직원 데이터 초기 세팅)
- 고객사별 커스텀 설정 (포스트 구조·역량 항목·색상 체계)
- 플랜별 기능 제한 (Basic / Pro / Enterprise)
- 관리자 콘솔 (사용량·결제·계정 관리)
- 제안서·조직진단 보고서 자동 생성 (PDF 출력)
- 조직 건강도 정기 리포트 이메일 발송

**가격 방향:** SaaS 월정액
- Basic: ₩300~500만/월
- Pro: ₩800만/월
- Enterprise: 별도 견적
- `[추후확인]` 가격 전략 최종 확정 필요

---

### 백서/제안서 핵심 서사

> "우리가 만든 도구(V1.0)를 직접 운영하며 검증한 조직 진단 + 인재 매칭 솔루션을,  
> 동일한 문제를 가진 다른 기업들에게 SaaS로 공급한다."
>
> → 자사 실사용 → 계열사 확장 → 외부 판매의 단계적 검증 스토리가 제안서의 핵심 서사

### 핵심 타겟 고객

| 구분 | 대상 | 설명 |
|------|------|------|
| PRIMARY TARGET | HRBP · 인사실장 | 핵심 포스트를 관리하고 내부 인재 육성·발령 의사결정을 주도하는 HR 전문가 |
| PRIMARY TARGET | 대표 · 경영진 | 조직 건강도와 핵심 포스트 리스크를 1장으로 파악하고 인사 의사결정에 활용하는 경영진 |
| EXPANSION TARGET | 계열사 · 외부기업 | 같은 문제를 가진 타 법인·외부 기업의 HR 담당자. V3.0에서 B2B SaaS로 공급 |

---

## 9. 구현 일정 (Phase 1 기준)

| 일자 | 목표 | 주요 산출물 |
|------|------|-------------|
| 2026-05-29 (D-Day) | 1차 프로토타입 | 포스트 매트릭스 + 판별기 V8.0 + 외부인재 PDF파싱 + 비즈니스 시나리오 기초 |
| 2026-06-01 (D+3, 월요일) | Level 4 시연 완성본 | DB 저장 안정화 + 전체 플로우 검수 + 시연용 샘플 데이터 정리 |
| 2026-06 중 | Phase 1 MVP 배포 | Vercel 배포 + 기본 인증 + 사내망 테스트 |
| 2026-07 이후 | Phase 2 착수 | SAP 연동 + 성과 데이터 반영 + 시나리오 고도화 |

---

## 10. 미확정 항목 [추후확인]

| 항목 | 내용 | 확인 필요 시점 |
|------|------|----------------|
| 채용 현황판 탭 | 빨간불 포스트와 외부 채용 연결 화면. 우선순위 미결정 | Phase 1 완료 후 |
| V3.0 세부 기능 | 멀티테넌트 구조 상세. 백서 초안 작성 후 실장님 확인 | Phase 2 착수 전 |
| 가격 전략 | V별 가격 책정 방식. Basic/Pro/Enterprise 플랜 구체화 | Phase 2 완료 후 |
| SAP 추출 최소 컬럼 | 1,000명+ 데이터 중 판별기에 올릴 정확한 컬럼 목록 확정 | 실데이터 교체 전 |
| 외부 판매 타겟 시장 | HR 컨설팅 시장 진입 방식 (직접영업/파트너십/인바운드) | V2.0 완료 후 |
| 법적 검토 | 개인정보보호법·인사데이터 처리 적법성 검토 | Phase 3 전 |

---

## 11. Phase 1 완료 기준 체크리스트

- [ ] 포스트 매트릭스를 조회·편집·저장할 수 있고 새로고침 후에도 데이터가 유지된다
- [ ] 포스트 셀 클릭 시 해당 과업 기준 내부 후보 판별기가 자동 실행된다
- [ ] scoreTalent V8.0이 현직자 앵커 유사도 + 포스트 특수성을 반영하여 종합 점수를 산출한다
- [ ] 추천 후보 카드에서 현직자 대비 비교 항목이 표시된다
- [ ] PDF 파일을 업로드하면 AI가 외부 인재 정보를 자동 구조화하고 저장한다
- [ ] 외부 인재의 포스트 적합도가 자동 계산되어 매칭 결과가 표시된다
- [ ] 비즈니스 시나리오(채용 시 예상 기여·리스크)가 생성된다
- [ ] 발령 검토 상태를 변경하고 메모를 저장할 수 있다
- [ ] Supabase에 데이터가 저장되고 다른 기기에서도 동일하게 조회된다
- [ ] 어떤 화면도 제안서 캡처에 적합한 기업용 UI 수준을 유지한다
- [ ] 실명 직원 데이터가 화면에 노출되지 않도록 샘플 데이터로 시연 모드가 작동한다

---

## 부록. scoreTalent V8.0 상세 알고리즘

```typescript
function scoreTalentV8(emp: CandidateInternal, taskKey: string): MatchResult {
  const prof = TASK_PROFILES[taskKey];

  // 1. 현직자 앵커 유사도 (25%) — 코사인 유사도
  const anchorEmp = EMPLOYEES.find(e => e.name === prof.anchor);
  let anchorSim = 50;
  if (anchorEmp) {
    const dims = ["열정","집요함","전략","시스템사고","팀워크","리더십"];
    let dotP = 0, magA = 0, magB = 0;
    dims.forEach(k => {
      const a = metricToScore(anchorEmp.metrics[k]);
      const b = metricToScore(emp.metrics[k]);
      dotP += a * b; magA += a * a; magB += b * b;
    });
    const cos = (magA && magB) ? dotP / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
    const discBonus = (emp.discScores[prof.discPrefer] > anchorEmp.discScores[prof.discPrefer]) ? 10 : 0;
    anchorSim = Math.min(100, Math.round(cos * 100 + discBonus));
  }

  // 2. 포스트 특수성: 필수 직무 부합도 (20%)
  const jobHitCount = prof.mustJob.filter(mj =>
    emp.job.some(jt => jt.includes(mj) || mj.includes(jt))
  ).length;
  const jobFit = prof.mustJob.length > 0
    ? Math.round((jobHitCount / prof.mustJob.length) * 100)
    : 60;
  const hardPenalty = prof.mustJob.length > 0 && jobHitCount === 0 ? 35 : 0;

  // 3. 핵심 역량 가중치 (20%)
  let capScore = 0;
  Object.entries(prof.competencyWeights).forEach(([k, w]) => {
    capScore += metricToScore(emp.metrics[k]) * w;
  });

  // 4. DISC 적합도 (13%)
  const discScore = Math.min(100, (emp.discScores[prof.discPrefer] || 0) * 4.5);

  // 5. 강점 매칭 (12%)
  const mustHit = prof.strengthMust.filter(s => emp.strengths.includes(s)).length;
  const preferHit = prof.strengthPrefer.filter(s => emp.strengths.includes(s)).length;
  const strScore = Math.min(100, mustHit * 25 + preferHit * 12
    + (mustHit === prof.strengthMust.length && prof.strengthMust.length > 0 ? 20 : 0));

  // 6. 즉시성 (10%)
  const evalBonus = { HP: 20, SP: 10, IP: 0, A: 5, C: -5 }[emp.avgEval] || 0;
  const ebgBonus = emp.ebgPass === "O" ? 18 : emp.ebgPass === "일부" ? 8 : 0;
  const readiness = Math.min(100,
    30 + evalBonus + ebgBonus
    + (emp.managerClass === "O" ? 10 : 0)
    + ({ 차장급: 8, 과장급: 12, 부장급: 5 }[emp.gradeGroup] || 0)
  );

  // 최종 합산
  let final =
    anchorSim   * 0.25 +
    jobFit      * 0.20 +
    capScore    * 0.20 +
    discScore   * 0.13 +
    strScore    * 0.12 +
    readiness   * 0.10;

  if (emp.gradeGroup === "임원") final -= 12;
  final -= hardPenalty * 0.5;
  final = Math.max(0, Math.min(98, Math.round(final)));

  const verdict = final >= 65 ? "즉시 검토" : final >= 48 ? "육성 후보" : "후순위/보류";

  return { totalScore: final, anchorSimilarity: anchorSim, postFit: jobFit,
           capability: capScore, discFit: discScore, strengthFit: strScore,
           readiness, verdict, ... };
}
```

---

*— 문서 끝 —*

> **PRD 버전 이력**
> | 버전 | 날짜 | 변경 내용 |
> |------|------|-----------|
> | v1.0 | 2026-05-29 | 초안 작성 (HO 인사실장 인터뷰 기반) |
