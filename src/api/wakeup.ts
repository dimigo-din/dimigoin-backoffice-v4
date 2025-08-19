import {getInstance} from "./client.ts";

const client = getInstance();

export type WakeupApply = {
  "id": string,
  "video_id": string,
  "video_title": string,
  "video_thumbnail": string,
  "video_channel": string,
  "week": string,
  "gender": string,
  "wakeupSongVote": {
    "id": string,
    "upvote": boolean,
  }[]
}

export const getWakeupSongList = async (): Promise<WakeupApply[]> => {
  return (await client.get("/manage/wakeup")).data;
}

export const selectWakeupSong = async (id: string): Promise<WakeupApply> => {
  return (await client.post("/manage/wakeup", { id: id })).data;
}

export const deleteWakeupSong = async (id: string): Promise<WakeupApply> => {
  return (await client.delete("/manage/wakeup?id="+id)).data;
}