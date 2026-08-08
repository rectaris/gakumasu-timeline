const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export const jsonResponse = (value: unknown, status = 200): Response =>
  Response.json(value, { status, headers: JSON_HEADERS });

export const errorResponse = (
  status: number,
  code: string,
  message: string,
): Response => jsonResponse({ error: { code, message } }, status);

export const requireSameOriginMutation = (request: Request): void => {
  const origin = request.headers.get("Origin");
  if (!origin || origin !== new URL(request.url).origin) {
    throw new HttpError(403, "forbidden", "The request was not allowed.");
  }
};

export const requireJsonContentType = (request: Request): void => {
  const contentType = request.headers.get("Content-Type")?.split(";", 1)[0];
  if (contentType?.trim().toLowerCase() !== "application/json") {
    throw new HttpError(415, "json_required", "A JSON request body is required.");
  }
};

export const readLimitedText = async (
  stream: ReadableStream<Uint8Array> | null,
  maximumBytes: number,
): Promise<string> => {
  if (!stream) return "";
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maximumBytes) {
        await reader.cancel();
        throw new HttpError(413, "payload_too_large", "The request body is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(body);
};

export const readJsonBody = async (
  request: Request,
  maximumBytes: number,
): Promise<unknown> => {
  requireJsonContentType(request);
  const contentLength = request.headers.get("Content-Length");
  if (contentLength && Number(contentLength) > maximumBytes) {
    throw new HttpError(413, "payload_too_large", "The request body is too large.");
  }
  let text: string;
  try {
    text = await readLimitedText(request.body, maximumBytes);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "invalid_body", "The request body is invalid.");
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "invalid_json", "The request body is not valid JSON.");
  }
};
