import * as XLSX from "xlsx";
import { PostCell, PostColor, PostRow } from "./types";
import { SAMPLE_MATRIX, COLOR_LABEL } from "./data/matrix";
import { TASK_PROFILES } from "./data/taskProfiles";

// 방식 B 엑셀 양식 (조직 한 줄, 8개 포스트가 옆으로)
export const EXCEL_HEADERS = [
  "조직",
  "현직자(F1)",
  "F2",
  "F3",
  "날개1",
  "날개2",
  "날개3",
  "날개4",
  "날개5",
];

export const EXCEL_GUIDE = "각 칸 형식: 과업명 / 담당자(직급/나이) / 신호등(빨간불·노란불·파란불). 공석은 담당자를 - 또는 공란. 칸 전체가 비면 빈 포스트.";

// ── 셀 ↔ 문자열 ─────────────────────────────────
function cellToStr(cell: PostCell): string {
  if (cell.color === "empty" && !cell.title && !cell.person) return "";
  const label = COLOR_LABEL[cell.color] ?? "";
  return [cell.title ?? "", cell.person ?? "", label]
    .map((s) => s.trim())
    .join(" / ");
}

function parseColor(raw: string): PostColor {
  const t = raw.trim().toLowerCase();
  if (["빨간불", "빨강", "red"].includes(t)) return "red";
  if (["노란불", "노랑", "yellow", "amber"].includes(t)) return "yellow";
  if (["파란불", "파랑", "초록불", "초록", "blue", "green"].includes(t))
    return "blue";
  return "empty";
}

function parseCell(raw: unknown): PostCell {
  const str = String(raw ?? "").trim();
  if (!str) return { title: "", person: "", color: "empty" };
  const parts = str.split("/").map((p) => p.trim());
  const title = parts[0] ?? "";
  const person = parts[1] ?? "";
  let color = parseColor(parts[2] ?? "");
  // 색 누락인데 내용이 있으면 기본 노란불(지켜보기)
  if (color === "empty" && (title || (person && person !== "-")))
    color = "yellow";
  const taskKey = title && TASK_PROFILES[title] ? title : undefined;
  return { title, person, color, taskKey };
}

// ── 템플릿(.xlsx) 생성 → 다운로드용 Blob ─────────
export function buildTemplateBlob(): Blob {
  const aoa: (string | undefined)[][] = [EXCEL_HEADERS];
  SAMPLE_MATRIX.forEach((row) => {
    const cells = [row.current, ...row.successors];
    const wings = [...row.wings];
    while (wings.length < 5) wings.push({ title: "", person: "", color: "empty" });
    aoa.push([
      row.area,
      ...cells.map(cellToStr),
      ...wings.slice(0, 5).map(cellToStr),
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [
    { wch: 10 },
    ...Array(8).fill({ wch: 30 }),
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "포스트매트릭스");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function slug(area: string, i: number): string {
  return `row-${i}-${area.replace(/\s+/g, "")}`;
}

// ── 업로드 파싱 → PostRow[] ──────────────────────
export function parseMatrixWorkbook(buf: ArrayBuffer): PostRow[] {
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    blankrows: false,
    defval: "",
  });

  const rows: PostRow[] = [];
  aoa.forEach((r, i) => {
    if (i === 0) return; // 헤더
    const area = String(r[0] ?? "").trim();
    if (!area) return;
    const current = parseCell(r[1]);
    const successors = [parseCell(r[2]), parseCell(r[3])];
    const wings = [
      parseCell(r[4]),
      parseCell(r[5]),
      parseCell(r[6]),
      parseCell(r[7]),
      parseCell(r[8]),
    ];
    rows.push({
      id: slug(area, rows.length),
      area,
      current,
      successors,
      wings,
    });
  });
  return rows;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
