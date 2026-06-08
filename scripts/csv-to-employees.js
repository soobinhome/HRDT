/**
 * 유통 직원 CSV → lib/data/employees.ts 자동 변환 스크립트
 * 실행: node scripts/csv-to-employees.js
 */

const fs = require("fs");
const path = require("path");

const INPUT  = "C:\\Users\\park_soobin02\\Downloads\\유통 - 시트1.csv";
const OUTPUT_JSON = path.join(__dirname, "..", "lib", "data", "employees.json");
const OUTPUT_TS   = path.join(__dirname, "..", "lib", "data", "employees.ts");

// ── 컬럼 인덱스 (0-based) ─ 시트1 v2 (출신학교·학과 col10-11 추가) ──
const C = {
  NAME: 3, ORG_GROUP: 4, ORG_NAME: 5,
  JOB_TYPE: 6, JOB_TITLE: 7, GRADE: 8,
  WORK_LOC: 9, SCHOOL: 10, MAJOR: 11,
  EMONEY: 12,
  LAST_PROMO: 15, GRADE_YEARS: 16,
  STATUS: 17, AGE: 19,
  LANG: 20, MATH: 21,
  PASSION: 22, PERSISTENCE: 23, STRATEGY: 24,
  SYS_THINK: 25, TEAMWORK: 26, LEADERSHIP: 27,
  COM_STYLE_LABEL: 28, AC: 29, PR: 30, PE: 31, ID: 32,
  DISC_LABEL: 33, D: 34, I: 35, S: 36, CV: 37,
  MBTI: 38,
  STR1: 43, STR2: 44, STR3: 45, STR4: 46, STR5: 47,
  JOB_DOMAIN: 48, BOTTOM_EXP: 49,
  EBG_PASS: 52, AVG_EVAL: 53,
  MGR_CLASS: 54, SPROUT_CLASS: 55,
};

// ── 학교 티어 매핑 ─────────────────────────────
const SCHOOL_TIER_MAP = {
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

function schoolTier(school) {
  if (!school) return "";
  return SCHOOL_TIER_MAP[school] || "기타대";
}

// ── 헬퍼 함수 ──────────────────────────────────

function v(cols, idx) {
  return (cols[idx] || "").trim();
}

function num(cols, idx, def = 0) {
  const n = parseFloat(v(cols, idx));
  return isNaN(n) ? def : n;
}

function metric(s) {
  return ["◎", "○", "△", "X", "-"].includes(s) ? s : "-";
}

function evalGrade(s) {
  return ["HP", "SP", "IP", "A", "C", "-"].includes(s) ? s : "-";
}

function ox3(s) {
  if (s === "O") return "O";
  if (s === "△" || s === "일부") return "일부";
  return "X";
}

function gradeGroup(grade) {
  if (["이사", "전무", "상무", "부사장", "사장", "회장"].some(g => grade.includes(g))) return "임원";
  if (grade.includes("부장")) return "부장급";
  if (grade.includes("차장")) return "차장급";
  if (grade.includes("과장")) return "과장급";
  if (grade.includes("대리")) return "대리급";
  return "사원급";
}

function dominantDisc(d, i, s, c) {
  const arr = [["D", d], ["I", i], ["S", s], ["C", c]];
  arr.sort((a, b) => b[1] - a[1]);
  return arr[0][0];
}

// ── CSV 파싱 ───────────────────────────────────
const raw = fs.readFileSync(INPUT, "utf-8");
const lines = raw.split(/\r?\n/);

// 사번이 있는 데이터 행만 추출 (,10xxxxxx, 패턴)
const dataLines = lines.filter(line => /^,\d{7,8},/.test(line));

console.log(`📊 데이터 행: ${dataLines.length}명 발견`);

const employees = dataLines
  .map((line, idx) => {
    const cols = line.split(",");

    const name      = v(cols, C.NAME);
    const status    = v(cols, C.STATUS);
    const grade     = v(cols, C.GRADE);

    if (!name) return null;

    const d  = num(cols, C.D);
    const i  = num(cols, C.I);
    const s  = num(cols, C.S);
    const c  = num(cols, C.CV);

    const strengths = [
      v(cols, C.STR1), v(cols, C.STR2), v(cols, C.STR3),
      v(cols, C.STR4), v(cols, C.STR5),
    ].filter(Boolean);

    const job = v(cols, C.JOB_DOMAIN) ? [v(cols, C.JOB_DOMAIN)] : [];

    const school = v(cols, C.SCHOOL);

    return {
      id:           `emp-${String(idx + 1).padStart(4, "0")}`,
      name,
      status,                              // 재직자 / 휴직자
      orgGroup:     v(cols, C.ORG_GROUP),
      orgName:      v(cols, C.ORG_NAME),
      jobType:      v(cols, C.JOB_TYPE),
      jobTitle:     v(cols, C.JOB_TITLE),
      grade,
      gradeGroup:   gradeGroup(grade),
      workLocation: v(cols, C.WORK_LOC),
      lastPromotion:v(cols, C.LAST_PROMO),
      gradeYears:   num(cols, C.GRADE_YEARS),
      age:          num(cols, C.AGE),
      school,
      major:        v(cols, C.MAJOR),
      schoolTier:   schoolTier(school),
      emoney:       num(cols, C.EMONEY),
      lang:         num(cols, C.LANG),
      math:         num(cols, C.MATH),
      metrics: {
        "열정":      metric(v(cols, C.PASSION)),
        "집요함":    metric(v(cols, C.PERSISTENCE)),
        "전략":      metric(v(cols, C.STRATEGY)),
        "시스템사고":metric(v(cols, C.SYS_THINK)),
        "팀워크":    metric(v(cols, C.TEAMWORK)),
        "리더십":    metric(v(cols, C.LEADERSHIP)),
      },
      comStyle: {
        AC: num(cols, C.AC),
        PR: num(cols, C.PR),
        PE: num(cols, C.PE),
        ID: num(cols, C.ID),
      },
      disc:       dominantDisc(d, i, s, c),
      discScores: { D: d, I: i, S: s, C: c },
      mbti:       v(cols, C.MBTI),
      strengths,
      job,
      avgEval:     evalGrade(v(cols, C.AVG_EVAL)),
      ebgPass:     ox3(v(cols, C.EBG_PASS)),
      managerClass:v(cols, C.MGR_CLASS) === "O",
      sproutClass: v(cols, C.SPROUT_CLASS) === "O",
      groundExp:   v(cols, C.BOTTOM_EXP) === "O",
    };
  })
  .filter(Boolean);

console.log(`✅ 유효 데이터: ${employees.length}명`);
console.log(`   재직자: ${employees.filter(e => e.status === "재직자").length}명`);
console.log(`   휴직자: ${employees.filter(e => e.status === "휴직자").length}명`);

// ── JSON 데이터 파일 저장 ─────────────────────
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(employees, null, 2), "utf-8");
console.log(`💾 JSON 저장: ${OUTPUT_JSON}`);

// ── TypeScript 래퍼 파일 생성 ─────────────────
const ts = `// ⚠️ 자동 생성 파일 — scripts/csv-to-employees.js 로 생성
// 생성일: ${new Date().toISOString().split("T")[0]}
// 총 ${employees.length}명

import { CandidateInternal } from "../types";
import rawData from "./employees.json";

export const SAMPLE_EMPLOYEES = rawData as unknown as CandidateInternal[];

export function findEmployeeByName(name?: string): CandidateInternal | undefined {
  if (!name) return undefined;
  return SAMPLE_EMPLOYEES.find((e) => e.name === name);
}
`;

fs.writeFileSync(OUTPUT_TS, ts, "utf-8");
console.log(`💾 TS  저장: ${OUTPUT_TS}`);
