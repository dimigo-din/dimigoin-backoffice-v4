import { stayFormat } from "../assets/stay_export_format.ts";
import type {Stay, StayApply} from "../api/stay.ts";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { maskName } from "./maskName.ts";
import html2pdf from "html2pdf.js";

export function stay2pdf(apply: StayApply[], stay: Stay, opt: { masking?: boolean} = {}, filename: string) {
  const html = generateHtml(apply, stay, opt);
  document.title = filename.replace(/\.pdf$/i, "");

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const styleNodes = doc.querySelectorAll("style");
  let originalStyles = "";
  styleNodes.forEach((node) => {
    originalStyles += node.innerHTML;
  });

  const fallbackStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');

    @page {
      size: A4;
      margin: 10mm 10mm 5mm 10mm;
    }

    body {
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      width: 100% !important;
      max-width: 100% !important;
      display: block;
      zoom: 0.95;
    }

    * {
      font-family: '함초롬바탕', 'Batang', 'Noto Sans KR', sans-serif;
      box-sizing: border-box;
    }

    table {
      width: 100% !important;
      border-collapse: collapse !important;
      table-layout: auto;
      font-size: 10pt;
      margin-bottom: 5px !important;
    }

    th {
      padding: 4px 2px;
      word-break: keep-all;
      border: none !important;
      text-align: center;
    }

    td {
      padding: 4px 2px;
      word-break: break-all;
      text-align: center;
    }

    tr {
      page-break-inside: avoid !important;
    }

    .logo {
      display: block;
      margin: 0 auto 10px auto !important;
      text-align: center;
      position: static !important;
      transform: none !important;
      break-inside: avoid;
      page-break-inside: avoid;
    }
  `;

  const bodyContent = doc.body.innerHTML || html;

const container = document.createElement("div");
container.innerHTML = `
  <style>${originalStyles + fallbackStyles}</style>
  ${bodyContent}
`;

container.style.width = "210mm";
container.style.background = "white";
container.style.padding = "10mm 10mm 5mm 10mm";
container.style.position = "fixed";
container.style.left = "-99999px";
container.style.top = "0";

document.body.appendChild(container);

html2pdf()
  .set({
    filename,
    margin: 0,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] },
  })
  .from(container)
  .save()
  .finally(() => {
    document.body.removeChild(container);
  });
}

function generateHtml(apply: StayApply[], stay: Stay, opt: { masking?: boolean} = {}) {
  let html = stayFormat;

  const data: {[key: string] : number | string} = {};

  const formatDate = (d?: string | Date) => d ? format(new Date(d), "MM-dd(eee)", { locale: ko }) : format(new Date(), "yyyy년 MM월 dd일 eee", { locale: ko });

  data["DATE"] = `${formatDate(stay.stay_from)} ~ ${formatDate(stay.stay_to)} ${stay.name} 현황`;
  data["TODAY"] = format(new Date(), "yyyy. MM. dd. 기준");
  for (let grade=1;grade<=6;grade++) {
    for (let uclass=1;uclass<=6;uclass++) {
      data[`${grade}_${uclass}_COUNT`] = apply.filter((a) => a.user.grade === grade && a.user.class === uclass).length;
    const maleStudents = apply.filter((a) => a.user.grade === grade && a.user.class === uclass && a.user.gender === "male").map((a) => opt.masking ? maskName(a.user.name) : a.user.name);
    const femaleStudents = apply.filter((a) => a.user.grade === grade && a.user.class === uclass && a.user.gender === "female").map((a) => opt.masking ? maskName(a.user.name) : a.user.name);

    data[`${grade}_${uclass}_MALE`] = maleStudents.reduce((acc, name, index) => {
      if (index > 0 && index % 12 === 0) acc += "<br>";
      return acc + (index % 12 === 0 ? "" : "&nbsp;&nbsp;") + name;
    }, "");

    data[`${grade}_${uclass}_FEMALE`] = femaleStudents.reduce((acc, name, index) => {
      if (index > 0 && index % 12 === 0) acc += "<br>";
      return acc + (index % 12 === 0 ? "" : "&nbsp;&nbsp;") + name;
    }, "");
    }
  }

  // per grade
  for (let grade=1;grade<=6;grade++) {
    data[`${grade}_COUNT`] = apply.filter((a) => a.user.grade === grade).length;
    // data[`${grade}_MALE_COUNT`] = apply.filter((a) => a.user.grade === grade && a.user.gender === "male").length;
    // data[`${grade}_FEMALE_COUNT`] = apply.filter((a) => a.user.grade === grade && a.user.gender === "female").length;
  }

  // all
  data["COUNT"] = apply.length;
  data["MALE_COUNT"] = apply.filter((a) => a.user.gender === "male").length;
  data["FEMALE_COUNT"] = apply.filter((a) => a.user.gender === "female").length;

  //  replacing
  for (const key of Object.keys(data)) {
    html = html.replace(`{${key}}`, data[key].toString());
  }

  return html;
}
