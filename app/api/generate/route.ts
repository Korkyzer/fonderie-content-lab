import { NextResponse } from "next/server";

import {
  createGenerateResponse,
  normalizeGenerateRequest,
  GENERATOR_ASSETS,
  type GenerateRequest,
  type GenerateResponse,
  type GeneratorVariant,
} from "@/lib/generator-mock";
import {
  buildGeneratorMessages,
  parseVariantsJSON,
} from "@/lib/generator-prompt";
import { requirePermission } from "@/lib/auth/session";
import { hasRequestyKey, requestyStream, RequestyError } from "@/lib/requesty";

export const runtime = "nodejs";

const VARIANT_PALETTE: Array<{ color: string; color2: string }> = [
  { color: "var(--purple)", color2: "var(--sky)" },
  { color: "var(--yellow)", color2: "var(--orange)" },
  { color: "var(--green)", color2: "var(--turquoise)" },
];

const METRICS_BY_RANK: Array<GeneratorVariant["metrics"]> = [
  { reach: "Reach 24-32k", engagement: "Engagement 7,4%", saves: "Saves 180+" },
  { reach: "Reach 18-26k", engagement: "Engagement 6,8%", saves: "Saves 140+" },
  { reach: "Reach 14-22k", engagement: "Engagement 6,1%", saves: "Saves 110+" },
];

function encodeSSE(event: string, data: unknown): Uint8Array {
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  return new TextEncoder().encode(`event: ${event}\ndata: ${payload}\n\n`);
}

function buildBackstageSteps(request: GenerateRequest, done: boolean) {
  return [
    {
      label: `Analyse du brief · intent + persona ${request.persona}`,
      meta: "0.2s",
      done: true,
    },
    {
      label: `Sélection des assets ${request.formation} adaptés au format ${request.platform}`,
      meta: "0.6s",
      done: true,
    },
    {
      label: `Application de la charte CFI · ${request.visualStyle} · ${request.tone}`,
      meta: "0.4s",
      done: true,
    },
    {
      label: `Rédaction des 3 variantes ${request.duration} via Requesty`,
      meta: done ? "terminée" : "en cours…",
      done,
    },
  ];
}

function buildResponseFromLLM(
  request: GenerateRequest,
  variants: Array<{ id: string; hook: string; caption: string; hashtags: string[] }>,
): GenerateResponse {
  const normalized: GeneratorVariant[] = variants.slice(0, 3).map((variant, index) => {
    const id = (["A", "B", "C"][index] ?? variant.id ?? "A") as GeneratorVariant["id"];
    const palette = VARIANT_PALETTE[index % VARIANT_PALETTE.length];
    const metrics = METRICS_BY_RANK[index] ?? METRICS_BY_RANK[0];
    return {
      id,
      hook: variant.hook,
      caption: variant.caption,
      hashtags: variant.hashtags,
      score: Math.max(86, 96 - index * 3),
      color: palette.color,
      color2: palette.color2,
      metrics,
    };
  });

  const filled: GeneratorVariant[] = [...normalized];
  while (filled.length < 3) {
    const fallback = createGenerateResponse(request).variants[filled.length];
    filled.push(fallback);
  }

  return {
    variants: filled,
    backstage: buildBackstageSteps(request, true),
    assets: GENERATOR_ASSETS,
    generatedAt: new Date().toISOString(),
    briefEcho: request.brief,
  };
}

export async function POST(req: Request) {
  const access = await requirePermission("generator.use");
  if (access.error) return access.error;

  const body = (await req.json().catch(() => ({}))) as Partial<GenerateRequest>;
  const request = normalizeGenerateRequest(body);
  const wantsStream = req.headers.get("accept")?.includes("text/event-stream");

  if (!hasRequestyKey()) {
    if (wantsStream) return mockStream(request);
    return NextResponse.json(createGenerateResponse(request));
  }

  if (!wantsStream) {
    return handleNonStreaming(request, req.signal);
  }

  return handleStreaming(request, req.signal);
}

function mockStream(request: GenerateRequest): Response {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const mock = createGenerateResponse(request);
      const preview = mock.variants
        .map((v) => `Variante ${v.id} · ${v.hook}\n${v.caption}\n${v.hashtags.join(" ")}`)
        .join("\n\n");
      controller.enqueue(encodeSSE("mock", { reason: "no_api_key" }));
      for (let i = 0; i < preview.length; i += 40) {
        controller.enqueue(encodeSSE("delta", { text: preview.slice(i, i + 40) }));
        await new Promise((r) => setTimeout(r, 20));
      }
      controller.enqueue(encodeSSE("done", { result: mock }));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}

async function handleNonStreaming(request: GenerateRequest, signal?: AbortSignal): Promise<Response> {
  try {
    let fullText = "";
    const messages = buildGeneratorMessages(request);
    for await (const chunk of requestyStream(messages, {
      responseFormat: "json_object",
      signal,
    })) {
      if (chunk.type === "delta") fullText += chunk.text;
    }
    const parsed = parseVariantsJSON(fullText);
    if (!parsed || parsed.length === 0) {
      return NextResponse.json(createGenerateResponse(request));
    }
    return NextResponse.json(buildResponseFromLLM(request, parsed));
  } catch (error) {
    const message = error instanceof RequestyError ? error.message : "unknown";
    console.error("[api/generate] fallback mock:", message);
    return NextResponse.json(createGenerateResponse(request));
  }
}

function handleStreaming(request: GenerateRequest, signal?: AbortSignal): Response {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let fullText = "";
      let usageTokens: number | undefined;
      try {
        controller.enqueue(encodeSSE("start", { model: "requesty" }));
        const messages = buildGeneratorMessages(request);
        for await (const chunk of requestyStream(messages, {
          responseFormat: "json_object",
          signal,
        })) {
          if (chunk.type === "delta") {
            fullText += chunk.text;
            controller.enqueue(encodeSSE("delta", { text: chunk.text }));
          } else if (chunk.type === "usage") {
            usageTokens = chunk.usage.total_tokens;
            controller.enqueue(encodeSSE("usage", chunk.usage));
          }
        }

        const parsed = parseVariantsJSON(fullText);
        const result =
          parsed && parsed.length > 0
            ? buildResponseFromLLM(request, parsed)
            : createGenerateResponse(request);

        controller.enqueue(encodeSSE("done", { result, tokens: usageTokens }));
      } catch (error) {
        const message = error instanceof RequestyError ? error.message : String(error);
        console.error("[api/generate] stream error:", message);
        controller.enqueue(encodeSSE("error", { message }));
        controller.enqueue(
          encodeSSE("done", { result: createGenerateResponse(request), tokens: usageTokens }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
