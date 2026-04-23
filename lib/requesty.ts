const REQUESTY_BASE_URL = "https://router.requesty.ai/v1";

export type RequestyMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function hasRequestyKey(): boolean {
  return Boolean(process.env.REQUESTY_API_KEY?.trim());
}

export async function requestyComplete(
  messages: RequestyMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: "text" | "json_object";
  } = {},
) {
  const apiKey = process.env.REQUESTY_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("REQUESTY_API_KEY manquante");
  }

  const response = await fetch(`${REQUESTY_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      model: options.model ?? "deepseek/deepseek-chat",
      messages,
      temperature: options.temperature ?? 0.5,
      max_tokens: options.maxTokens ?? 900,
      stream: false,
      ...(options.responseFormat === "json_object"
        ? { response_format: { type: "json_object" } }
        : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(await buildRequestyError(response));
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return {
    text: json.choices?.[0]?.message?.content ?? "",
  };
}

async function buildRequestyError(response: Response): Promise<string> {
  const body = await response.text();
  const detail = body.trim().slice(0, 240);

  return detail.length > 0
    ? `Requesty HTTP ${response.status}: ${detail}`
    : `Requesty HTTP ${response.status}`;
}
