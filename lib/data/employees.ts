// ⚠️ 자동 생성 파일 — scripts/csv-to-employees.js 로 생성
// 생성일: 2026-06-07
// 총 1109명

import { CandidateInternal } from "../types";
import rawData from "./employees.json";

export const SAMPLE_EMPLOYEES = rawData as unknown as CandidateInternal[];

export function findEmployeeByName(name?: string): CandidateInternal | undefined {
  if (!name) return undefined;
  return SAMPLE_EMPLOYEES.find((e) => e.name === name);
}
