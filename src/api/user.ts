import {getInstance} from "./client.ts";

const client = getInstance();

export type User = {
  id: string;
  email: string;
  name: string;
  permission: string;
};

export const searchUser = async (name: string): Promise<User[]> => {
  return (await client.get("/manage/user/search?name="+name)).data;
}

export const renderHtml = async (html: string, filename: string) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = client.defaults.baseURL+"/manage/user/renderHtml";
  form.target = "_blank";
  form.style.display = "none";

  const htmlInput = document.createElement("input");
  htmlInput.name = "html";
  htmlInput.value = html;
  htmlInput.type = "hidden";

  const filenameInput = document.createElement("input");
  filenameInput.name = "filename";
  filenameInput.value = filename;
  filenameInput.type = "hidden";

  form.appendChild(htmlInput);
  form.appendChild(filenameInput);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};