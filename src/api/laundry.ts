import {getInstance} from "./client.ts";

const client = getInstance();

export type LaundryTimelineListItem = {
  id: string;
  name: string;
  enabled: boolean;
}

export type LaundryMachine = {
  id: string;
  type: "washer" | "dryer";
  name: string;
  gender: "male" | "female";
  enabled: boolean;
}

export type LaundryTime = {
  id: string;
  time: string;
  grade: (1 | 2 | 3)[];
  assigns: LaundryMachine[];
}

export type LaundryTimeline = {
  id: string;
  name: string;
  triggeredOn: "primary" | "stay";
  enabled: boolean;
  times: LaundryTime[];
}

export type LaundryTimelinePayload = {
  name: string;
  triggeredOn: "primary" | "stay";
  times: {
    time: string;
    grade: (1 | 2 | 3)[];
    assigns: string[];
  }[];
}

export type LaundryMachinePayload = {
  type: "washer" | "dryer";
  name: string;
  gender: "male" | "female";
  enabled: boolean;
}

export const getLaundryTimelineList = async (): Promise<LaundryTimelineListItem[]> => {
  return (await client.get("/manage/laundry/timeline/list")).data;
}

export const getLaundryTimeline = async (id: string): Promise<LaundryTimeline> => {
  return (await client.get("/manage/laundry/timeline?id="+id)).data;
}

export const createLaundryTimeline = async (data: LaundryTimelinePayload): Promise<LaundryTimeline> => {
  return (await client.post("/manage/laundry/timeline", data)).data;
}

export const updateLaundryTimeline = async (data: LaundryTimelinePayload & { id: string }): Promise<LaundryTimeline> => {
  return (await client.patch("/manage/laundry/timeline", data)).data;
}

export const deleteLaundryTimeline = async (id: string): Promise<LaundryTimeline> => {
  return (await client.delete("/manage/laundry/timeline?id="+id)).data;
}

export const enableLaundryTimeline = async (id: string): Promise<LaundryTimeline> => {
  return (await client.patch("/manage/laundry/timeline/enable", { id: id })).data;
}

export const getLaundryMachineList = async (): Promise<LaundryMachine[]> => {
  return (await client.get("/manage/laundry/machine/list")).data;
}

export const createLaundryMachine = async (data: LaundryMachinePayload): Promise<LaundryMachine> => {
  return (await client.post("/manage/laundry/machine", data)).data;
}

export const updateLaundryMachine = async (data: LaundryMachinePayload & { id: string }): Promise<LaundryMachine> => {
  return (await client.patch("/manage/laundry/machine", data)).data;
}

export const deleteLaundryMachine = async (id: string): Promise<LaundryMachine> => {
  return (await client.delete("/manage/laundry/machine?id="+id)).data;
}