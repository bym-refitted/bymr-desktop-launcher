import { Method } from "$lib/enums/Method";
import { BASE_URL } from "$lib/globals";
import { currentGameVersion } from "$lib/stores/loadState";
import { get } from "svelte/store";
import { fetch } from "@tauri-apps/plugin-http";

/**
 * Represents a generic API response.
 * @template T - The type of the data in the response.
 */
interface ApiResponse<T> {
  status: number;
  data: T;
}

/**
 * Represents an error response from the API.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Makes an API request to the specified route with the given form data and method.
 *
 * @template T - The type of the data expected in the response.
 * @param {string} route - The API route to request.
 * @param {object} [formData={}] - The form data to send with the request.
 * @param {string} [method=Method.POST] - The HTTP method to use for the request.
 * @returns {Promise<ApiResponse<T>>} - A promise that resolves to the API response.
 * @throws {Error} - Throws an error if the request fails or the response is not ok.
 */
export const invokeApiRequest = async <T>(
  route: string,
  formData = {},
  method: Method = Method.POST
): Promise<ApiResponse<T>> => {
  try {
    const version = get(currentGameVersion);
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: method !== Method.GET ? JSON.stringify(formData) : undefined,
    };

    const url = `${BASE_URL}/api/v${version}-beta${route}`;
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorResponse: ErrorResponse = await response.json();
      throw new Error(errorResponse.error);
    }

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    const errorMessage =
      `An unexpected error occurred: ${error}` || "Could not get error details";
    throw new Error(errorMessage);
  }
};
