import { invokeApiRequest } from './invokeApiRequest';
import { Status } from '$lib/enums/StatusCodes';
import { Method } from '$lib/enums/Method';

export const getAvailableLanguages = async () => {
  const { status, data } = await invokeApiRequest('/supportedLangs', null, Method.GET);

  if (status === Status.OK && data) return new Set([...(data as string[])]);
};
