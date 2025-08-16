// gpted

import XLSX from "xlsx-js-style";
import type { StayApply } from "../api/stay.ts";

function genderKo(g: string) {
  if (g === "male") return "남";
  if (g === "female") return "여";
  return g ?? "";
}

// ---- Types for strongly-typed cells/styles (no `any`) ----
type CellColor = { rgb?: string };
interface CellBorderSide { style?: string; color?: CellColor }
interface CellStyle {
  font?: { name?: string; sz?: number; bold?: boolean };
  alignment?: { horizontal?: string; vertical?: string };
  fill?: { fgColor?: CellColor };
  border?: { top?: CellBorderSide; bottom?: CellBorderSide; left?: CellBorderSide; right?: CellBorderSide };
}

type StylableCell = XLSX.CellObject & { s?: CellStyle };

const ORANGE = "ED7D32"; // border color
const PEACH = "FFE6D8";  // header bg
const FONT = { name: "맑은 고딕", sz: 10 } as const;

const headerStyle: CellStyle = {
  font: { ...FONT, bold: true },
  alignment: { horizontal: "center", vertical: "center" },
  fill: { fgColor: { rgb: PEACH } },
  border: {
    top: { style: "thin", color: { rgb: ORANGE } },
    bottom: { style: "thin", color: { rgb: ORANGE } },
    left: { style: "thin", color: { rgb: ORANGE } },
    right: { style: "thin", color: { rgb: ORANGE } },
  },
};

const cellStyle: CellStyle = {
  font: { ...FONT },
  alignment: { horizontal: "center", vertical: "center" },
  border: {
    top: { style: "thin", color: { rgb: ORANGE } },
    bottom: { style: "thin", color: { rgb: ORANGE } },
    left: { style: "thin", color: { rgb: ORANGE } },
    right: { style: "thin", color: { rgb: ORANGE } },
  },
};

const titleStyle: CellStyle = {
  font: { name: "맑은 고딕", sz: 14, bold: true },
  alignment: { horizontal: "center", vertical: "center" },
  fill: { fgColor: { rgb: PEACH } },
  border: {
    top: { style: "thin", color: { rgb: ORANGE } },
    bottom: { style: "thin", color: { rgb: ORANGE } },
    left: { style: "thin", color: { rgb: ORANGE } },
    right: { style: "thin", color: { rgb: ORANGE } },
  },
};

function todayBannerText(): string {
  const now = new Date();
  const md = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(now);
  const dow = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", weekday: "short" }).format(now).replace("요일", "");
  const hm = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
  return `잔류 및 외출 신청 현황 (${md} ${dow} ${hm} 기준)`;
}

function hhmmKST(s?: string) {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;

  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
}

function applyGridStyle(ws: XLSX.WorkSheet) {
  if (!ws["!ref"]) return;
  const range = XLSX.utils.decode_range(ws["!ref"]!);
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellRef] as StylableCell | undefined;
      if (!cell) continue;
      if (R === 1) {
        cell.s = headerStyle;
      } else if (R === 0) {
        cell.s = titleStyle;
      } else {
        cell.s = cellStyle;
      }
    }
  }
}

export type ExportOptions = {
  filename?: string;
};

export function ExportStayAppliesToExcel(applies: StayApply[], opts: ExportOptions = {}) {
  const filename = (opts.filename && (opts.filename.endsWith(".xlsx") ? opts.filename : `${opts.filename}.xlsx`))
    || "잔류 및 외출 현황.xlsx";

  // Columns exactly like the sample: 학년, 반, 인원, 학번, 이름, 성별, 조식, 중식, 석식, 외출, 위치
  const headers = ["학년", "반", "인원", "학번", "이름", "성별", "조식", "중식", "석식", "외출", "위치"];

  // ---- helper to build one worksheet from a subset of applies ----
  const buildSheet = (subset: StayApply[]): XLSX.WorkSheet => {
    type Header = (typeof headers)[number];
    type Row = { [K in Header]: string | number };

    // Normalize + sort (학년, 반, 번호)
    const rows: Row[] = [...subset]
      .sort((a, b) => (Number(a.user.grade) || 0) - (Number(b.user.grade) || 0)
        || (Number(a.user.class) || 0) - (Number(b.user.class) || 0)
        || (Number(a.user.number) || 0) - (Number(b.user.number) || 0))
      .map(a => {
        const grade = a.user.grade ?? "";
        const klass = a.user.class ?? "";
        const number = a.user.number ?? "";
        const hakbun = `${grade}${klass}${String(number).padStart(2, "0")}`;

        // Only approved outings, join with comma
        const approved = (a.outing || []).filter(o => o.approved);
        const outingText = approved.map(o => `${hhmmKST(o.from)}~${hhmmKST(o.to)} (${o.reason ?? ""})`).join(", ");

        // Meal flags: O unless any approved outing cancels that meal
        const bCancel = approved.some(o => o.breakfast_cancel);
        const lCancel = approved.some(o => o.lunch_cancel);
        const dCancel = approved.some(o => o.dinner_cancel);

        return {
          "학년": a.user.grade ?? "",
          "반": a.user.class ?? "",
          "인원": 1, // temporary; will be replaced with merged count per class later
          "학번": hakbun,
          "이름": a.user.name,
          "성별": genderKo(a.user.gender),
          "조식": bCancel ? "X" : "O",
          "중식": lCancel ? "X" : "O",
          "석식": dCancel ? "X" : "O",
          "외출": outingText,
          "위치": a.stay_seat ?? "",
        };
      });

    const title = todayBannerText();
    const aoa: (string | number)[][] = [
      [title, ...Array(headers.length - 1).fill("")],
      headers,
      ...rows.map(r => headers.map(h => r[h]))
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    (ws["!merges"] as XLSX.Range[] | undefined) ??= [];
    (ws["!merges"] as XLSX.Range[]).push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });

    // Remove helper for merged regions (avoid Excel repair by deleting non-top-left cells):
    const delIfExists = (row: number, col: number) => {
      const ref = XLSX.utils.encode_cell({ r: row, c: col });
      if (ws[ref]) {
        // delete the cell completely so the merged area only keeps top-left
        delete ws[ref];
      }
    };

    // Remove cells in merged title row except top-left
    for (let c = 1; c < headers.length; c++) {
      delIfExists(0, c);
    }

    const get = (row: number, col: number) => ws[XLSX.utils.encode_cell({ r: row, c: col })]?.v as string | number | undefined;

    // Compute merges for 학년(column 0), 반(column 1), 인원(column 2)
    const startRow = 2; // data begins at row index 2 in AOA
    let r = startRow;
    while (r < startRow + rows.length) {
      const grade = get(r, 0);
      // Find grade block
      let r2 = r;
      while (r2 < startRow + rows.length && get(r2, 0) === grade) r2++;

      // Merge 학년 column over [r, r2-1]
      if (r2 - r > 1) {
        (ws["!merges"] as XLSX.Range[]).push({ s: { r, c: 0 }, e: { r: r2 - 1, c: 0 } });
        for (let q = r + 1; q < r2; q++) delIfExists(q, 0);
      }

      // Within grade block, group by 반 for merges in 반/인원
      let k = r;
      while (k < r2) {
        const klass = get(k, 1);
        let k2 = k;
        while (k2 < r2 && get(k2, 1) === klass) k2++;
        const count = k2 - k;

        if (count > 1) {
          // 반 병합 + 하단 셀 삭제
          (ws["!merges"] as XLSX.Range[]).push({ s: { r: k, c: 1 }, e: { r: k2 - 1, c: 1 } });
          for (let q = k + 1; q < k2; q++) delIfExists(q, 1);

          // 인원 병합 + 상단 "N명" + 하단 셀 삭제
          (ws["!merges"] as XLSX.Range[]).push({ s: { r: k, c: 2 }, e: { r: k2 - 1, c: 2 } });
          const topRef = XLSX.utils.encode_cell({ r: k, c: 2 });
          const topCell = (ws[topRef] ??= { t: "s", v: "" }) as StylableCell;
          topCell.t = "s"; // ensure string type (avoid Excel repair from number->string swap)
          topCell.v = `${count}명`;
          for (let q = k + 1; q < k2; q++) delIfExists(q, 2);
        } else {
          // 인원 1명 표시(병합 없음)
          const oneRef = XLSX.utils.encode_cell({ r: k, c: 2 });
          const oneCell = (ws[oneRef] ??= { t: "s", v: "" }) as StylableCell;
          oneCell.t = "s"; // force string type
          oneCell.v = "1명";
        }

        k = k2;
      }

      r = r2;
    }

    (ws["!cols"] as XLSX.ColInfo[]) = headers.map(h => {
      if (h === "외출") return { wch: 60 };
      if (h === "위치") return { wch: 18 };
      if (h === "학번") return { wch: 12 };
      return { wch: 8 + (h.length > 2 ? 2 : 0) };
    });

    applyGridStyle(ws);

    (ws["!rows"] as XLSX.RowInfo[]) = [ { hpt: 45 }, { hpt: 30 } ];
    return ws;
  };

  // ---- Build workbook with 4 sheets: 전체 + 학년별(1,2,3) ----
  const wb = XLSX.utils.book_new();

  // 0) 전체
  const fullWs = buildSheet(applies);
  XLSX.utils.book_append_sheet(wb, fullWs, "잔류 및 외출");

  // 1~3학년: create three additional sheets regardless of data presence
  const gradeNums = [1, 2, 3] as const;
  for (const g of gradeNums) {
    const subset = applies.filter(a => String(a.user.grade ?? "") === String(g));
    const ws = buildSheet(subset);
    XLSX.utils.book_append_sheet(wb, ws, `${g}학년`);
  }

  XLSX.writeFile(wb, filename);
}