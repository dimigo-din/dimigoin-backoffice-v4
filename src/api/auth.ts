import {getInstance} from "./client.ts";
import { openDB, type DBSchema } from "idb";

const client = getInstance();

export type PersonalInformation = {
  gender: "male" | "female";
  mail: string;
  name: string;
  grade: number;
  class: number;
  number: number;
};

const PERSONAL_INFO_DB = "dimigoin";
const PERSONAL_INFO_STORE = "personalInformation";

interface PersonalInfoDB extends DBSchema {
  personalInformation: {
    key: string;
    value: PersonalInformation;
  };
}

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
  await client.get("/auth/logout");
}

export async function getPersonalInformation(email: string[]): Promise<(PersonalInformation | null)[]> {
  try {
    if (email.length === 0) return [];
    const db = await openDB<PersonalInfoDB>(PERSONAL_INFO_DB, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(PERSONAL_INFO_STORE)) {
          db.createObjectStore(PERSONAL_INFO_STORE, { keyPath: "mail" });
        }
      },
    });
    const all = await db.getAll(PERSONAL_INFO_STORE);

    const map = new Map<string, PersonalInformation>();
    for (const item of all) {
      if (!item || typeof item !== "object") continue;
      const rec = item as PersonalInformation;
      if (!rec.mail || !rec.name || !rec.gender) continue;
      map.set(rec.mail, rec);
    }

    return email.map((mail) => map.get(mail) ?? null);
  } catch (e) {
    console.error(e);
    return email.map(() => null);
  }
}
