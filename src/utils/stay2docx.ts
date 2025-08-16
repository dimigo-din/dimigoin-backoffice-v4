import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  BorderStyle,
  TextRun,
  ShadingType,
} from "docx";
import type { StayApply } from "../api/stay";

export interface DocxOptions {
  filename?: string;
  dateText?: string;
  masking?: boolean
}

const RED = "ED7D32"; // border color
const PEACH = "FFE6D8"; // header/background fill

function kDate(d = new Date()): string {
  const dayNames = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"];
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 ${dayNames[d.getDay()]}`;
}

function borders(color = RED) {
  return {
    top:    { style: BorderStyle.SINGLE, color, size: 4 },
    bottom: { style: BorderStyle.SINGLE, color, size: 4 },
    left:   { style: BorderStyle.SINGLE, color, size: 4 },
    right:  { style: BorderStyle.SINGLE, color, size: 4 },
  } as const;
}

export async function ExportStayAppliesToDocx(applies: StayApply[], opts: DocxOptions = {}): Promise<void> {
  const filename = opts.filename ?? "잔류 학생 명단.docx";
  const dateText = opts.dateText ?? kDate();

  // group
  interface ClassGroup { male: StayApply[]; female: StayApply[] }
  const grouped: Record<string, Record<string, ClassGroup>> = {};
  applies.forEach(a => {
    const g = String(a.user.grade ?? "");
    const c = String(a.user.class ?? "");
    if (!grouped[g]) grouped[g] = {};
    if (!grouped[g][c]) grouped[g][c] = { male: [], female: [] };
    const isMale = a.user.gender === "male";
    (isMale ? grouped[g][c].male : grouped[g][c].female).push(a);
  });

  const sectionsChildren: (Paragraph | Table)[] = [];

  // ===== title table =====

  const makeText = (text: string, bold = false, size = 24, align: "center" | "left" = "center") =>
    new Paragraph({
      children: [new TextRun({ text, bold, size })],
      alignment: align,
    });

  const makeVertical = (text: string, bold = true, size = 24) =>
    new Paragraph({
      alignment: "center",
      children: [new TextRun({ text: text.split("").join("\n"), bold, size })],
    });

  const titleRow = new TableRow({
    children: [
      new TableCell({
        columnSpan: 3,
        borders: borders(),
        shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" },
        width: { size: 60, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
        children: [makeText("잔류 학생 명단 (LIFE.DIMIGO.IN)", true, 24)],
      }),
      new TableCell({
        rowSpan: 2,
        borders: borders(),
        shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" },
        width: { size: 5, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
        children: [makeVertical("결재", true, 24)],
      }),
      ...["근무교사","부장","생활관장"].map(t =>
        new TableCell({
          borders: borders(),
          shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" },
          width: { size: 35/3, type: WidthType.PERCENTAGE },
          verticalAlign: "center",
          children: [makeText(t, true, 24)],
        })
      ),
    ],
  });
  const subRow = new TableRow({
    children: [
      new TableCell({
        columnSpan: 3,
        borders: borders(),
        shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" },
        width: { size: 60, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
        children: [makeText(dateText, false, 24, "center")],
      }),
      new TableCell({
        borders: borders(),
        shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" },
        width: { size: 5, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
        children: [makeText("")],
      }),
      ...Array.from({ length: 2 }).map(() =>
        new TableCell({
          borders: borders(),
          shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" },
          width: { size: 35/3, type: WidthType.PERCENTAGE },
          verticalAlign: "center",
          children: [makeText("")],
        })
      ),
    ],
    height: { value: 800, rule: "atLeast" },
  });

  const titleTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [titleRow, subRow],
    borders: { top: borders().top, bottom: borders().bottom, left: borders().left, right: borders().right },
  });

  sectionsChildren.push(titleTable, new Paragraph(""));

  // ===== main table =====
  const mainRows: TableRow[] = [];
  const headerWidths = [8, 8, 10, 8, 50, 16]; // percentage
  const headerCells = ["학년","반","인원","구분","토요일 잔류명단","비고"].map((h, idx) =>
    new TableCell({
      borders: borders(),
      shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" },
      children: [makeText(h, true, 24, "center")],
      width: { size: headerWidths[idx], type: WidthType.PERCENTAGE },
      verticalAlign: "center",
    })
  );
  mainRows.push(new TableRow({ children: headerCells }));

  let grandMale = 0, grandFemale = 0;
  const sortedGrades = Object.keys(grouped).sort((a,b)=>Number(a)-Number(b));
  for (const g of sortedGrades) {
    const classes = Object.keys(grouped[g]).sort((a,b)=>Number(a)-Number(b));
    let gradeMale = 0, gradeFemale = 0;
    for (const c of classes) {
      const grp = grouped[g][c];
      const maleN = grp.male.length, femaleN = grp.female.length;
      gradeMale += maleN; gradeFemale += femaleN;
      const total = maleN + femaleN;
      const joinNames = (arr: StayApply[]) => arr.map(x=>x.user.name.split("").map((x2, i) => opts.masking && i === 1 ? "*" : x2).join("")).join(" ");

      // male row with merged grade/class/total (rowSpan 2)
      mainRows.push(new TableRow({ children: [
        new TableCell({ rowSpan: 2, borders: borders(), shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" }, width: { size: headerWidths[0], type: WidthType.PERCENTAGE }, verticalAlign: "center", children: [makeText(g)] }),
        new TableCell({ rowSpan: 2, borders: borders(), width: { size: headerWidths[1], type: WidthType.PERCENTAGE }, verticalAlign: "center", children: [makeText(c)] }),
        new TableCell({ rowSpan: 2, borders: borders(), width: { size: headerWidths[2], type: WidthType.PERCENTAGE }, verticalAlign: "center", children: [makeText(`${total}명`)] }),
        new TableCell({ borders: borders(), width: { size: headerWidths[3], type: WidthType.PERCENTAGE }, verticalAlign: "center", children: [makeText("남")] }),
        new TableCell({ borders: borders(), width: { size: headerWidths[4], type: WidthType.PERCENTAGE }, children: [makeText(joinNames(grp.male), false, 22, "left")] }),
        new TableCell({ borders: borders(), width: { size: headerWidths[5], type: WidthType.PERCENTAGE }, children: [makeText("")] }),
      ] }));
      // female row
      mainRows.push(new TableRow({ children: [
        new TableCell({ borders: borders(), width: { size: headerWidths[3], type: WidthType.PERCENTAGE }, verticalAlign: "center", children: [makeText("여")] }),
        new TableCell({ borders: borders(), width: { size: headerWidths[4], type: WidthType.PERCENTAGE }, children: [makeText(joinNames(grp.female), false, 22, "left")] }),
        new TableCell({ borders: borders(), width: { size: headerWidths[5], type: WidthType.PERCENTAGE }, children: [makeText("")] }),
      ] }));
    }
    mainRows.push(new TableRow({ children: [
      new TableCell({ borders: borders(), shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" }, width: { size: headerWidths[0], type: WidthType.PERCENTAGE }, children: [makeText("소계", true)] }),
      new TableCell({ borders: borders(), shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" }, width: { size: headerWidths[1], type: WidthType.PERCENTAGE }, children: [makeText("")] }),
      new TableCell({ borders: borders(), shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" }, width: { size: headerWidths[2], type: WidthType.PERCENTAGE }, children: [makeText(`${gradeMale + gradeFemale}명`, true)] }),
      new TableCell({ borders: borders(), shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" }, width: { size: headerWidths[3], type: WidthType.PERCENTAGE }, children: [makeText("")] }),
      new TableCell({ borders: borders(), shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" }, width: { size: headerWidths[4], type: WidthType.PERCENTAGE }, children: [makeText(`(남${gradeMale} + 여${gradeFemale})`)] }),
      new TableCell({ borders: borders(), shading: { fill: PEACH, type: ShadingType.CLEAR, color: "auto" }, width: { size: headerWidths[5], type: WidthType.PERCENTAGE }, children: [makeText("")] }),
    ] }));
    grandMale += gradeMale; grandFemale += gradeFemale;
  }
  mainRows.push(new TableRow({ children: [
    new TableCell({ borders: borders(), width: { size: headerWidths[0], type: WidthType.PERCENTAGE }, children: [makeText("총", true)] }),
    new TableCell({ borders: borders(), width: { size: headerWidths[1], type: WidthType.PERCENTAGE }, children: [makeText("")] }),
    new TableCell({ borders: borders(), width: { size: headerWidths[2], type: WidthType.PERCENTAGE }, children: [makeText(`${grandMale + grandFemale}명`, true)] }),
    new TableCell({ borders: borders(), width: { size: headerWidths[3], type: WidthType.PERCENTAGE }, children: [makeText("")] }),
    new TableCell({ borders: borders(), width: { size: headerWidths[4], type: WidthType.PERCENTAGE }, children: [makeText(`(남${grandMale} + 여${grandFemale})`, true)] }),
    new TableCell({ borders: borders(), width: { size: headerWidths[5], type: WidthType.PERCENTAGE }, children: [makeText("")] }),
  ] }));

  const mainTable = new Table({ rows: mainRows, width: { size: 100, type: WidthType.PERCENTAGE } });
  sectionsChildren.push(mainTable);

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children: sectionsChildren,
      },
    ],
  });

  // ===== save =====
  if (typeof window !== "undefined") {
    const blob = await Packer.toBlob(doc);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    const buf = await Packer.toBuffer(doc);
    const fs = await import("node:fs");
    fs.writeFileSync(filename, buf);
  }
}
