import { stayFormat } from "../assets/stay_export_format.ts";
import type {Stay, StayApply} from "../api/stay.ts";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {maskName} from "./maskName.ts";

export function stay2pdf(apply: StayApply[], stay: Stay, opt: { masking?: boolean} = {}) {
  let html = stayFormat;

  const data: {[key: string] : number | string} = {};

  const formatDate = (d?: string | Date) => d ? format(new Date(d), "MM-dd(eee)", { locale: ko }) : format(new Date(), "yyyy년 MM월 dd일 eee", { locale: ko });

  data["DATE"] = `${formatDate(stay.stay_from)} ~ ${formatDate(stay.stay_to)} ${stay.name} 현황`;
  data["TODAY"] = format(new Date(), "yyyy. MM. dd. 기준");  

// per class
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