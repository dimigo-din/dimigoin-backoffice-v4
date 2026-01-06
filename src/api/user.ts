import { getInstance } from "./client.ts";
import printJS from "print-js";

const client = getInstance();

export type User = {
  id: string;
  email: string;
  name: string;
  permission: string;
};

export const searchUser = async (name: string): Promise<User[]> => {
  return (await client.get("/manage/user/search?name=" + name)).data;
};

export const renderHtml = (fullHtml: string, filename: string) => {
  document.title = filename.replace(/\.pdf$/i, "");

  const parser = new DOMParser();
  const doc = parser.parseFromString(fullHtml, "text/html");

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

  const bodyContent = doc.body.innerHTML || fullHtml;

  printJS({
    printable: bodyContent,
    type: 'raw-html',
    style: originalStyles + fallbackStyles,
    documentTitle: document.title,
    scanStyles: false,
    font: '함초롬바탕',
    onError: (err) => console.error('PrintJS Error:', err),
  });
};