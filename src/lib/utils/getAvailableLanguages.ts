import { invokeApiRequest } from "./invokeApiRequest";
import { Status } from "$lib/enums/StatusCodes";
import { Method } from "$lib/enums/Method";

export const getAvailableLanguages = async (languages: string[]) => {
  try {
    const { status, data } = await invokeApiRequest(
      "/supportedLangs",
      null,
      Method.GET
    );

    if (status === Status.OK && data) languages.push(...(data as string[]));
  } catch (error) {
    console.error("Error getting available languages:", error);
  }
};
