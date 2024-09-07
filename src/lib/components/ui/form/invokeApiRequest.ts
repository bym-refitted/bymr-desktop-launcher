import { BASE_URL, PORT } from "$lib/globals";
import { currentGameVersion } from "$lib/stores/loadState";
import { get } from "svelte/store";

export interface FormData {
  username: string;
  email: string;
  password: string;
}

interface Response<T> {
  status: number;
  data: T;
  token?: string;
}

export const invokeApiRequest = async <T>(
  route: string,
  formData: FormData,
  method: string = "POST"
): Promise<Response<T>> => {
  try {
    const version = get(currentGameVersion);
    const response = await fetch(
      `${BASE_URL}:${PORT}/api/v${version}-alpha/${route}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) throw new Error("invokeApiRequest response was not ok");

    const data = await response.json();
    const token = data.token;
    return { status: response.status, data, token };
  } catch (error) {
    throw new Error("invokeApiRequest failed");
  }
};
