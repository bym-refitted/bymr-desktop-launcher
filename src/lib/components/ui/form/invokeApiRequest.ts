import { BASE_URL, PORT } from "$lib/globals";

export interface FormData {
  username?: string;
  email: string;
  password: string;
}

interface Response<T> { user: T }

// TODO: API Versioning should not be hardcoded, can we get this from manifest.json?
export const invokeApiRequest = async <T>(
  relPath: string,
  formData: FormData,
  method: string = "POST"
): Promise<Response<T>> => {
  try {
    const response = await fetch(
      `${BASE_URL}:${PORT}/api/v0.2.8-alpha/${relPath}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) throw new Error("invokeApiRequest response was not ok");

    return await response.json();
  } catch (error) {
    throw new Error("invokeApiRequest failed");
  }
};
