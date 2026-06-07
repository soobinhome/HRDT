/**
 * 유통 직원 CSV → lib/data/employees.ts 자동 변환 스크립트
 * 실행: node scripts/csv-to-employees.js
 */

const fs = require("fs");
const path = require("path");

const INPUT  = "C:\\Users\\great\\Downloads\\유통 - 시트1.csv";
const OUTPUT_JSON = path.join(__dirname, "..", "lib", "data", "employees.json");
const OUTPUT_TS   = path.join(__dirname, "..", "lib", "data", "employees.ts");

// ── 컬럼 인덱스 (0-based) ──────────────────────
const C = {
  NAME: 3, ORG_GROUP: 4, ORG_NAME: 5,
  JOB_TYPE: 6, JOB_TITLE: 7, GRADE: 8,
  WORK_LOC: 9, EMONEY: 10,
  LAST_PROMO: 13, GRADE_YEARS: 14,
  STATUS: 15, AGE: 17,
  LANG: 18, MATH: 19,
  PASSION: 20, PERSISTENCE: 21, STRATEGY: 22,
  SYS_THINK: 23, TEAMWORK: 24, LEADERSHIP: 25,
  COM_STYLE_LABEL: 26, AC: 27, PR: 28, PE: 29, ID: 30,
  DISC_LABEL: 31, D: 32, I: 33, S: 34, CV: 35,
  MBTI: 36,
  STR1: 41, STR2: 42, STR3: 43, STR4: 44, STR5: 45,
  JOB_DOMAIN: 46, BOTTOM_EXP: 47,
  EBG_PASS: 50, AVG_EVAL: 51,
  MGR_CLASS: 52, SPROUT_CLASS: 53,
};

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

    return {
      id:           `emp-${String(idx + 1).padStart(4, "0")}`,
      name,
      status,                              // 재직자 / 휴직자
      orgGroup:     v(cols, C.ORG_GROUP),
      orgName:      v(cols, C.ORG_NAME),
      grade,
      gradeGroup:   gradeGroup(grade),
      workLocation: v(cols, C.WORK_LOC),
      lastPromotion:v(cols, C.LAST_PROMO),
      gradeYears:   num(cols, C.GRADE_YEARS),
      age:          num(cols, C.AGE),
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
