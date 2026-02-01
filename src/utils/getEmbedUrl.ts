import { UrlParameters } from '../types';

export const getEmbedUrl = (
  baseUrl?: string,
  urlParameters?: UrlParameters,
  addConfiguration?: boolean
) => {
  const urlSearchParams = new URLSearchParams();

  urlSearchParams.set('embed', '1');
  urlSearchParams.set('proto', 'json');

  if (addConfiguration) {
    urlSearchParams.set('configure', '1');
  }

  if (urlParameters) {
    Object.keys(urlParameters).forEach((key) => {
      const value = urlParameters[key as keyof UrlParameters];

      if (value !== undefined) {
        if (typeof value === 'boolean') {
          urlSearchParams.set(key, value ? '1' : '0');
        } else {
          urlSearchParams.set(key, value.toString());
        }
      }
    });
  }

  const resolvedBaseUrl = baseUrl ?? '/drawio/index.html';

  // baseUrl can be absolute (https://...) or relative (/drawio/). Support both.
  try {
    const url = new URL(resolvedBaseUrl);
    url.search = urlSearchParams.toString();
    return url.toString();
  } catch {
    const [pathWithQuery, hash] = resolvedBaseUrl.split('#', 2);
    const [path, existingQuery] = pathWithQuery.split('?', 2);
    const params = new URLSearchParams(existingQuery ?? '');

    urlSearchParams.forEach((value, key) => {
      params.set(key, value);
    });

    const search = params.toString();
    return `${path}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
  }
};
