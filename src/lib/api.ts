const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(
    message: string,
    status: number,
    data: unknown = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null;
};

export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    body,
    headers,
    ...requestOptions
  } = options;

  const requestHeaders = new Headers(headers);

  const isFormData =
    body instanceof FormData;

  const isBlob =
    body instanceof Blob;

  const isURLSearchParams =
    body instanceof URLSearchParams;

  const isArrayBuffer =
    body instanceof ArrayBuffer;

  const isJsonObject =
    body !== undefined &&
    body !== null &&
    typeof body === 'object' &&
    !isFormData &&
    !isBlob &&
    !isURLSearchParams &&
    !isArrayBuffer;

  /*
   * Automatically set JSON content type for
   * normal JavaScript objects.
   */
  if (
    isJsonObject &&
    !requestHeaders.has('Content-Type')
  ) {
    requestHeaders.set(
      'Content-Type',
      'application/json',
    );
  }

  /*
   * Build a valid BodyInit value.
   *
   * Record<string, unknown> is converted to JSON.
   * Everything else is already a valid BodyInit.
   */
  let requestBody:
    | BodyInit
    | null
    | undefined;

  if (
    body === undefined ||
    body === null
  ) {
    requestBody = body;
  } else if (isJsonObject) {
    requestBody = JSON.stringify(body);
  } else {
    requestBody = body;
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...requestOptions,

      method:
        requestOptions.method ?? 'GET',

      /*
       * Required for SkillCompass's
       * HttpOnly session cookie.
       */
      credentials: 'include',

      headers: requestHeaders,

      body: requestBody,
    },
  );

  const contentType =
    response.headers.get(
      'content-type',
    ) ?? '';

  let data: unknown;

  if (
    contentType.includes(
      'application/json',
    )
  ) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : `Request failed with status ${response.status}`;

    throw new ApiError(
      message,
      response.status,
      data,
    );
  }

  return data as T;
}
