const REQUESTY_BASE_URL = "https://router.requesty.ai/v1";
const DEFAULT_MODEL = "anthropic/claude-sonnet-4-20250514";
const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_MAX_RETRIES = 2;

export type RequestyMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type RequestyUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export type RequestyStreamChunk =
  | { type: "delta"; text: string }
  | { type: "usage"; usage: RequestyUsage }
  | { type: "done"; fullText: string; usage?: RequestyUsage };

export type RequestyOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
  timeoutMs?: number;
  maxRetries?: number;
  signal?: AbortSignal;
};

export class RequestyError extends Error {
  readonly status?: number;
  readonly retryable: boolean;

  constructor(message: string, opts: { status?: number; retryable?: boolean } = {}) {
    super(message);
    this.name = "RequestyError";
    this.status = opts.status;
    this.retryable = Boolean(opts.retryable);
  }
}
export function hasRequestyKey(): boolean {
  return Boolean(process.env.REQUESTY_API_KEY?.trim());
}

function getApiKey(): string {
  const key = process.env.REQUESTY_API_KEY?.trim();
  if (!key) {
    throw new RequestyError("REQUESTY_API_KEY manquante dans l'environnement", {
      retryable: false,
    });
  }
  return key;
}

async function requestyFetch(
  body: Record<string, unknown>,
  opts: RequestyOptions,
): Promise<Response> {
  const apiKey = getApiKey();
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (opts.signal) {
    if (opts.signal.aborted) controller.abort();
    else opts.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(`${REQUESTY_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const retryable = response.status >= 500 || response.status === 429;
      const text = await response.text().catch(() => "");
      throw new RequestyError(
        `Requesty HTTP ${response.status}: ${text.slice(0, 200) || response.statusText}`,
        { status: response.status, retryable },
      );
    }

    return response;
  } catch (error) {
    if (error instanceof RequestyError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new RequestyError(`Requesty timeout après ${timeoutMs}ms`, { retryable: true });
    }
    throw new RequestyError(
      `Requesty network error: ${error instanceof Error ? error.message : String(error)}`,
      { retryable: true },
    );
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const retryable = error instanceof RequestyError && error.retryable;
      if (!retryable || attempt === maxRetries) break;
      const delay = 250 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
      attempt += 1;
    }
  }
  throw lastError;
}

export async function requestyComplete(
  messages: RequestyMessage[],
  opts: RequestyOptions = {},
): Promise<{ text: string; usage?: RequestyUsage }> {
  const maxRetries = opts.maxRetries ?? DEFAULT_MAX_RETRIES;

  const body: Record<string, unknown> = {
    model: opts.model ?? DEFAULT_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 1600,
    stream: false,
  };
  if (opts.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const response = await withRetry(() => requestyFetch(body, opts), maxRetries);
  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: RequestyUsage;
  };
  const text = json.choices?.[0]?.message?.content ?? "";
  return { text, usage: json.usage };
}

export async function* requestyStream(
  messages: RequestyMessage[],
  opts: RequestyOptions = {},
): AsyncGenerator<RequestyStreamChunk, void, unknown> {
  const maxRetries = opts.maxRetries ?? DEFAULT_MAX_RETRIES;

  const body: Record<string, unknown> = {
    model: opts.model ?? DEFAULT_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 1600,
    stream: true,
    stream_options: { include_usage: true },
  };
  if (opts.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const response = await withRetry(() => requestyFetch(body, opts), maxRetries);
  if (!response.body) {
    throw new RequestyError("Requesty: réponse sans body", { retryable: true });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  let usage: RequestyUsage | undefined;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary: number;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        for (const line of rawEvent.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
              usage?: RequestyUsage;
            };
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              yield { type: "delta", text: delta };
            }
            if (parsed.usage) {
              usage = parsed.usage;
              yield { type: "usage", usage };
            }
          } catch {
            continue;
          }
        }
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {}
  }

  yield { type: "done", fullText, usage };
}
