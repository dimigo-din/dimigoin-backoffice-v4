import {getInstance} from "./client.ts";
import axios from "axios";

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
  return (await client.post("/auth/login/google/callback", {code, redirect_uri: location.protocol + "//" + location.host + "/login"})).data;
}

export async function logout(): Promise<void> {
  localStorage.clear();
  await client.get("/auth/logout");
}

export async function getPersonalInformation(email: string[]): Promise<(PersonalInformation | null)[]> {
  let res: ({gender: "male" | "female", mail: string, name: string, number: string} | null)[];
  try {
    res  = (await axios.post("https://dimiauth.findflag.kr/personalInformation", { mail: [...email] }, { headers: { "Authorization": "Bearer "+localStorage.getItem("personalInformationKey") } })).data;
    // res = email.map((e) => {
    //   return e === "yeonfish6040@dimigo.hs.kr" ? {
    //     gender: "male",
    //     mail: "yeonfish6040@dimigo.hs.kr",
    //     name: "이연준",
    //     number: "2419",
    //   } : null;
    // });
  }catch (e) {
    console.log(e);
    localStorage.clear();
    await logout();
    location.href = "/login";

    throw new Error();
  }
  return res.map((personalInformation): PersonalInformation | null => {
    if (!personalInformation) return null;
    const parsedNumber = {
      grade: parseInt(personalInformation.number.substring(0, 1)),
      class: parseInt(personalInformation.number.substring(1, 2)),
      number: parseInt(personalInformation.number.substring(2, 4)),
    }
    return {
      ...personalInformation,
      ...parsedNumber,
    };
  });
}