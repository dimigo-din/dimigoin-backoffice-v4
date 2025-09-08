import { stayFormat } from "../assets/stay_export_format.ts";
import type {Stay, StayApply} from "../api/stay.ts";
import moment from "moment";
import {maskName} from "./maskName.ts";

export function stay2pdf(apply: StayApply[], stay: Stay, opt: { masking?: boolean} = {}) {
  let html = stayFormat;

  const data: {[key: string] : number | string} = {};

  data["DATE"] = `${stay.stay_from || moment().format("YYYY년 MM월 DD일 dddd")} ~ ${stay.stay_to || moment().format("YYYY년 MM월 DD일 dddd")} ${stay.name}`;
  data["TODAY"] = moment().format("YYYY. MM. DD. 기준");  

// per class
for (let grade=1;grade<=6;grade++) {
    for (let uclass=1;uclass<=6;uclass++) {
      data[`${grade}_${uclass}_COUNT`] = apply.filter((a) => a.user.grade === grade && a.user.class === uclass).length;
      data[`${grade}_${uclass}_MALE`] = apply.filter((a) => a.user.grade === grade && a.user.class === uclass && a.user.gender === "male").map((a) => opt.masking ? maskName(a.user.name) : a.user.name).join(" ");
      data[`${grade}_${uclass}_FEMALE`] = apply.filter((a) => a.user.grade === grade && a.user.class === uclass && a.user.gender === "female").map((a) => opt.masking ? maskName(a.user.name) : a.user.name).join(" ");
    }
  }

  // per grade
  for (let grade=1;grade<=6;grade++) {
    data[`${grade}_COUNT`] = apply.filter((a) => a.user.grade === grade).length;
    data[`${grade}_MALE_COUNT`] = apply.filter((a) => a.user.grade === grade && a.user.gender === "male").length;
    data[`${grade}_FEMALE_COUNT`] = apply.filter((a) => a.user.grade === grade && a.user.gender === "female").length;
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