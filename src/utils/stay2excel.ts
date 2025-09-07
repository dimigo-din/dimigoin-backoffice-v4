// gpted (merged-border fix)

import XLSX from "xlsx-js-style";
import type { StayApply, Stay } from "../api/stay.ts";

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

// ---- Styles ----
const ORANGE = "ED7D32"; // border color
const PEACH  = "FFE6D8"; // header bg
const FONT   = { name: "맑은 고딕", sz: 10 } as const;

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

const totalStyle: CellStyle = {
  font: { ...FONT, bold: true },
  alignment: { horizontal: "center", vertical: "center" },
  fill: { fgColor: { rgb: PEACH } },
};

const gradeClassStyle: CellStyle = {
  font: { ...FONT, bold: true },
  alignment: { horizontal: "center", vertical: "center" },
  border: {
    top: { style: "thin", color: { rgb: ORANGE } },
    bottom: { style: "thin", color: { rgb: ORANGE } },
    left: { style: "thin", color: { rgb: ORANGE } },
    right: { style: "thin", color: { rgb: ORANGE } },
  },
};

// ---- Title ----
function createSheetTitle(date: Date, grade?: number): string {
  const md  = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(date);
  const dow = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", weekday: "short" }).format(date).replace("요일", "");
  const now = new Date();
  const currentMd  = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(now);
  const currentDow = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", weekday: "short" }).format(now).replace("요일", "");
  const currentHm  = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
  const gradeText = grade ? `${grade}학년 ` : "";
  return `${md}(${dow}) ${gradeText}잔류 및 외출 신청 현황 (${currentMd} ${currentDow} ${currentHm} 기준)`;
}

// ---- Time ----
function hhmmKST(s?: string) {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
}

// ---- KST day range helper ----
function kstDayRange(d: Date) {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d); // YYYY-MM-DD in KST
  const start = new Date(`${ymd}T00:00:00+09:00`);
  const end   = new Date(`${ymd}T23:59:59.999+09:00`);
  return { start, end };
}

// ---- Grid styling ----
function applyGridStyle(ws: XLSX.WorkSheet) {
  if (!ws["!ref"]) return;
  const range = XLSX.utils.decode_range(ws["!ref"]!);

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellRef] as StylableCell | undefined;
      if (!cell) continue;

      if (R === 1) {
        cell.s = headerStyle;      // 헤더 행
      } else if (R === 0) {
        cell.s = titleStyle;       // 제목 행
      } else if (R === range.e.r) {
        cell.s = totalStyle;       // 마지막 행 (총원)
      } else {
        if (C >= 0 && C <= 2) {
          cell.s = gradeClassStyle; // 학년-반-인원
        } else {
          cell.s = cellStyle;       // 일반 데이터
        }
      }
    }
  }
}

// ---- Stay 기간 날짜들 ----
function getStayDates(stay: Stay): Date[] {
  const dates: Date[] = [];
  const startDate = new Date(stay.stay_from);
  const endDate   = new Date(stay.stay_to);

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

// ==================== 병합 셀 보더 안정화 유틸 ====================
type BorderSide = "top" | "bottom" | "left" | "right";

// 셀 객체 보장(없으면 생성). 값은 빈 문자열로 두고 스타일만 입힐 수 있게.
function ensureCell(ws: XLSX.WorkSheet, r: number, c: number): StylableCell {
  const ref = XLSX.utils.encode_cell({ r, c });
  const cell = (ws[ref] ??= { t: "s", v: "" }) as StylableCell;
  return cell;
}

// delete 대신 값만 비우기(Repair 방지 + 스타일 가능)
function clearMergedCell(ws: XLSX.WorkSheet, r: number, c: number) {
  const cell = ensureCell(ws, r, c);
  cell.t = "s";
  cell.v = "";
}

function setBorder(cell: StylableCell, side: BorderSide, rgb = ORANGE) {
  cell.s ??= {};
  cell.s.border ??= {};
  (cell.s.border as any)[side] = { style: "thin", color: { rgb } };
}

/** 병합 범위의 “외곽선”만 덧칠해 테두리 끊김 방지 */
function strokeOutline(ws: XLSX.WorkSheet, range: XLSX.Range, rgb = ORANGE) {
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const isTop    = r === range.s.r;
      const isBottom = r === range.e.r;
      const isLeft   = c === range.s.c;
      const isRight  = c === range.e.c;
      if (!(isTop || isBottom || isLeft || isRight)) continue;

      const cell = ensureCell(ws, r, c);
      if (isTop)    setBorder(cell, "top", rgb);
      if (isBottom) setBorder(cell, "bottom", rgb);
      if (isLeft)   setBorder(cell, "left", rgb);
      if (isRight)  setBorder(cell, "right", rgb);
    }
  }
}

// ==================== Export ====================
export type ExportOptions = { filename?: string };

export function ExportStayAppliesToExcel(currentStay: Stay, applies: StayApply[], opts: ExportOptions = {}) {
  const filename =
    (opts.filename && (opts.filename.endsWith(".xlsx") ? opts.filename : `${opts.filename}.xlsx`)) ||
    `잔류 및 외출 현황(${currentStay.stay_from.slice(5, 10)}~${currentStay.stay_to.slice(5, 10)}).xlsx`;

  // Columns
  const headers = ["학년", "반", "인원", "학번", "이름", "성별", "조식", "중식", "석식", "외출", "위치"] as const;

  // ---- helper to build one worksheet ----
  const buildSheet = (subset: StayApply[], date: Date, grade?: number): XLSX.WorkSheet => {
    type Header = (typeof headers)[number];
    type Row = { [K in Header]: string | number };

    // Normalize + sort (학년, 반, 번호)
    const rows: Row[] = [...subset]
      .sort((a, b) =>
        (Number(a.user.grade) || 0) - (Number(b.user.grade) || 0) ||
        (Number(a.user.class) || 0) - (Number(b.user.class) || 0) ||
        (Number(a.user.number) || 0) - (Number(b.user.number) || 0)
      )
      .map(a => {
        const grade = a.user.grade ?? "";
        const klass = a.user.class ?? "";
        const number = a.user.number ?? "";
        const hakbun = `${grade}${klass}${String(number).padStart(2, "0")}`;

        // Only approved outings that overlap the specific KST date
        const approved = (a.outing || []).filter(o => o.approved);
        const { start: dayStart, end: dayEnd } = kstDayRange(date);
        const dateSpecificOutings = approved.filter(o => {
          if (!o.from && !o.to) return false;
          const from = o.from ? new Date(o.from) : new Date(o.to!);
          const to   = o.to   ? new Date(o.to)   : from;
          // overlap with [dayStart, dayEnd] in KST
          return to >= dayStart && from <= dayEnd;
        });
        const outingText = dateSpecificOutings
          .map(o => `${hhmmKST(o.from)}~${hhmmKST(o.to)} (${o.reason ?? ""})`)
          .join(", ");

        const bCancel = dateSpecificOutings.some(o => o.breakfast_cancel);
        const lCancel = dateSpecificOutings.some(o => o.lunch_cancel);
        const dCancel = dateSpecificOutings.some(o => o.dinner_cancel);

        return {
          "학년": a.user.grade ?? "",
          "반": a.user.class ?? "",
          "인원": 1, // 병합 로직에서 대체
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

    const title = createSheetTitle(date, grade);

    // 총원 행
    const totalCount = rows.length;
    const totalRow = [
      `총원 (${totalCount}명)`, // 학년-반-인원 통합
      "", "",                    // 병합될 빈 셀들
      "", "", "", "", "", "", "", "" // 나머지 빈 셀들
    ];

    const aoa: (string | number)[][] = [
      [title, ...Array(headers.length - 1).fill("")],
      [...headers],
      ...rows.map(r => headers.map(h => r[h])),
      totalRow
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    (ws["!merges"] as XLSX.Range[] | undefined) ??= [];

    // 제목 행 병합
    (ws["!merges"] as XLSX.Range[]).push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });

    // 총원 행 병합
    const lastRowIndex = 2 + rows.length;
    (ws["!merges"] as XLSX.Range[]).push({ s: { r: lastRowIndex, c: 0 }, e: { r: lastRowIndex, c: 2 } });
    (ws["!merges"] as XLSX.Range[]).push({ s: { r: lastRowIndex, c: 3 }, e: { r: lastRowIndex, c: headers.length - 1 } });

    // 병합 내부: delete 대신 값만 비우기(clear) — 스타일 가능
    for (let c = 1; c < headers.length; c++) clearMergedCell(ws, 0, c);              // 타이틀
    for (let c = 1; c <= 2; c++) clearMergedCell(ws, lastRowIndex, c);               // 총원 왼쪽 병합 내부
    for (let c = 4; c < headers.length; c++) clearMergedCell(ws, lastRowIndex, c);   // 총원 오른쪽 병합 내부

    // 학년/반/인원 병합 처리
    const get = (row: number, col: number) =>
      ws[XLSX.utils.encode_cell({ r: row, c: col })]?.v as string | number | undefined;

    const startRow = 2; // 데이터 시작 (0: 제목, 1: 헤더)
    let r = startRow;
    while (r < startRow + rows.length) {
      const gradeVal = get(r, 0);

      // 같은 학년 블록 범위 [r, r2)
      let r2 = r;
      while (r2 < startRow + rows.length && get(r2, 0) === gradeVal) r2++;

      // 학년 병합
      if (r2 - r > 1) {
        (ws["!merges"] as XLSX.Range[]).push({ s: { r, c: 0 }, e: { r: r2 - 1, c: 0 } });
        for (let q = r + 1; q < r2; q++) clearMergedCell(ws, q, 0);
      }

      // 같은 학년 내에서 반/인원 병합
      let k = r;
      while (k < r2) {
        const klass = get(k, 1);
        let k2 = k;
        while (k2 < r2 && get(k2, 1) === klass) k2++;
        const count = k2 - k;

        if (count > 1) {
          // 반 병합
          (ws["!merges"] as XLSX.Range[]).push({ s: { r: k, c: 1 }, e: { r: k2 - 1, c: 1 } });
          for (let q = k + 1; q < k2; q++) clearMergedCell(ws, q, 1);

          // 인원 병합 + 상단 "N명"
          (ws["!merges"] as XLSX.Range[]).push({ s: { r: k, c: 2 }, e: { r: k2 - 1, c: 2 } });
          const topRef  = XLSX.utils.encode_cell({ r: k, c: 2 });
          const topCell = (ws[topRef] ??= { t: "s", v: "" }) as StylableCell;
          topCell.t = "s";
          topCell.v = `${count}명`;
          for (let q = k + 1; q < k2; q++) clearMergedCell(ws, q, 2);
        } else {
          // 1명
          const oneRef  = XLSX.utils.encode_cell({ r: k, c: 2 });
          const oneCell = (ws[oneRef] ??= { t: "s", v: "" }) as StylableCell;
          oneCell.t = "s";
          oneCell.v = "1명";
        }

        k = k2;
      }

      r = r2;
    }

    // 열 너비
    (ws["!cols"] as XLSX.ColInfo[]) = headers.map(h => {
      if (h === "외출") return { wch: 60 };
      if (h === "위치") return { wch: 12 };
      if (h === "학번") return { wch: 8 };
      if (h === "조식" || h === "중식" || h === "석식") return { wch: 6 };
      if (h === "이름") return { wch: 10 };
      return { wch: 8 + (h.length > 2 ? 2 : 0) };
    });

    // 스타일 일괄 적용
    applyGridStyle(ws);

    // 🔶 병합된 모든 영역의 외곽선 덧칠(끊김 방지)
    const merges = ws["!merges"] as XLSX.Range[];
    if (Array.isArray(merges)) {
      for (const m of merges) strokeOutline(ws, m, ORANGE);
    }

    // 행 높이
    (ws["!rows"] as XLSX.RowInfo[]) = [
      { hpt: 45 },                         // 제목
      { hpt: 30 },                         // 헤더
      ...Array(rows.length).fill({ hpt: 20 }),
      { hpt: 30 }                          // 총원
    ];

    return ws;
  };

  // ---- Build workbook with Stay period dates ----
  const wb = XLSX.utils.book_new();

  // Stay 기간 내의 모든 날짜
  const stayDates = getStayDates(currentStay);

  // 날짜별 전체 시트
  for (const date of stayDates) {
    const dayOfWeek = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", weekday: "short" })
      .format(date)
      .replace("요일", "");
    const dateApplies = applies; // 기간 내 전체 적용

    const fullWs = buildSheet(dateApplies, date);
    XLSX.utils.book_append_sheet(wb, fullWs, `전체(${dayOfWeek})`);
  }

  // 학년별 시트 (날짜순 → 학년순)
  const gradeNums = [1, 2, 3] as const;
  for (const g of gradeNums) {
    for (const date of stayDates) {
      const dayOfWeek = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", weekday: "short" })
        .format(date)
        .replace("요일", "");
      const dateApplies = applies;
      const gradeApplies = dateApplies.filter(a => String(a.user.grade ?? "") === String(g));

      const gradeWs = buildSheet(gradeApplies, date, g);
      XLSX.utils.book_append_sheet(wb, gradeWs, `${g}학년(${dayOfWeek})`);
    }
  }

  XLSX.writeFile(wb, filename);
}
