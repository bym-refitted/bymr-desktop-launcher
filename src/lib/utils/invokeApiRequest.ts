import { Method } from "$lib/enums/Method";
import { BASE_URL, PORT } from "$lib/globals";
import { currentGameVersion } from "$lib/stores/loadState";
import { get } from "svelte/store";

export interface FormData {
  username: string;
  email?: string;
  password: string;
  token?: string;
}

interface Response<T> {
  status: number;
  data: T;
  token?: string;
}

export const invokeApiRequest = async <T>(
  route: string,
  formData: FormData,
  method: string = Method.POST
): Promise<Response<T>> => {
  try {
    const version = get(currentGameVersion);
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (method !== Method.GET) options.body = JSON.stringify(formData);

    const url = `${BASE_URL}:${PORT}/api/v${version}-alpha${route}`;
    const response = await fetch(url, options);

    if (!response.ok) throw new Error("invokeApiRequest response was not ok");

    const data = await response.json();
    const token = data.token;
    return { status: response.status, data, token };
  } catch (error) {
    throw new Error("invokeApiRequest failed, Reason: " + error);
  }
};
