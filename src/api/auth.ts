import axios from "axios";
import {getInstance} from "./client.ts";

const client = getInstance();

export type PersonalInformation = {
  gender: "male" | "female";
  mail: string;
  name: string;
  grade: number;
  class: number;
  number: number;
};

export async function ping(): Promise<"퐁"> {
  return (await client.get("/auth/ping")).data;
}

export async function getRedirectUri(): Promise<string> {
  return (await client.get("/auth/login/google?redirect_uri=" + location.protocol + "//" + location.host + "/login")).data;
}

export async function passwordLogin(email: string, password: string): Promise<{
  accessToken: string,
  refreshToken: string
}> {
  return (await client.post("/auth/login/password", {email, password})).data;
}

export async function googleLogin(code: string): Promise<{ accessToken: string, refreshToken: string }> {
  return (await client.post("/auth/login/google/callback", {code})).data;
}

export async function logout(): Promise<void> {
  await client.get("/logout");
}

export async function getPersonalInformation(email: string[]): Promise<PersonalInformation[]> {
  const res: {gender: "male" | "female", mail: string, name: string, number: string}[] = (await axios.get("https://dimiauth.findflag.kr/personalInformation", { headers: { "Authorization": localStorage.getItem("personalInformationKey") }, data: JSON.stringify({mail: email}) })).data;
  return res.map((personalInformation): PersonalInformation => {
    const parsedNumber = {
      grade: parseInt(personalInformation.number.substring(0, 1)),
      class: parseInt(personalInformation.number.substring(1, 2)),
      number: parseInt(personalInformation.number.substring(2, 4)),
    }
    return {
      ...personalInformation,
      ...parsedNumber,
    };
  })
}