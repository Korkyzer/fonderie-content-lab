import { NextResponse } from "next/server";

import {
  buildCampaignMessages,
  buildMockKit,
  parseCampaignItemsJSON,
  slugifyCampaignObjective,
  type CampaignGenerateRequest,
} from "@/lib/campaign-prompt";
import {
  createCampaignKit,
  getCampaignKitBySlug,
  type CampaignKitItem,
} from "@/lib/data/templates";
import { hasRequestyKey, requestyComplete, RequestyError } from "@/lib/requesty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_PLATFORMS = [
  "Instagram Reel",
  "Instagram Story",
  "Instagram Carrousel",
  "LinkedIn",
  "TikTok",
  "Email",
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function readStringList(payload: Record<string, unknown>, field: string): string[] {
  const value = payload[field];
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function normalizeRequest(payload: unknown): CampaignGenerateRequest | { error: string } {
  if (!isRecord(payload)) return { error: "Payload JSON invalide" };
  const objective = typeof payload.objective === "string" ? payload.objective.trim() : "";
  if (!objective) return { error: "Champ manquant : objective" };

  const formationRaw = typeof payload.formation === "string" ? payload.formation.trim() : "";
  const eventRaw = typeof payload.eventName === "string" ? payload.eventName.trim() : "";

  const audiences = readStringList(payload, "audiences");
  const platformsInput = readStringList(payload, "platforms");
  const platforms = platformsInput.filter((p) => VALID_PLATFORMS.includes(p));

  return {
    objective,
    formation: formationRaw || undefined,
    eventName: eventRaw || undefined,
    audiences: audiences.length > 0 ? audiences : ["Lycéens 16-20"],
    platforms: platforms.length > 0 ? platforms : ["Instagram Reel", "LinkedIn", "Email"],
  };
}

function buildSlug(objective: string): string {
  const base = slugifyCampaignObjective(objective);
  const stamp = Date.now().toString(36).slice(-5);
  let candidate = `${base}-${stamp}`;
  let suffix = 2;
  while (getCampaignKitBySlug(candidate)) {
    candidate = `${base}-${stamp}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
  }

  const normalized = normalizeRequest(body);
  if ("error" in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  let items: CampaignKitItem[] = [];
  let source: "requesty" | "mock" = "mock";
  let tokens: number | undefined;

  if (hasRequestyKey()) {
    try {
      const messages = buildCampaignMessages(normalized);
      const completion = await requestyComplete(messages, {
        responseFormat: "json_object",
        maxTokens: 2400,
      });
      const parsed = parseCampaignItemsJSON(completion.text);
      if (parsed && parsed.length > 0) {
        items = parsed;
        source = "requesty";
        tokens = completion.usage?.total_tokens;
      } else {
        items = buildMockKit(normalized);
      }
    } catch (error) {
      const message = error instanceof RequestyError ? error.message : String(error);
      console.error("[api/campaign/generate] fallback mock:", message);
      items = buildMockKit(normalized);
    }
  } else {
    items = buildMockKit(normalized);
  }

  const slug = buildSlug(normalized.objective);
  const kit = createCampaignKit({
    slug,
    objective: normalized.objective,
    formation: normalized.formation ?? null,
    eventName: normalized.eventName ?? null,
    templateSlug: null,
    source,
    items: JSON.stringify(items),
    tokensUsed: tokens ?? null,
    generatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ kit, source, tokens: tokens ?? null });
}
