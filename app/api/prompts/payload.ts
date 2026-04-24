import { slugify, type NewPrompt } from "@/lib/data/prompts";

type ParseResult<T> = { data: T } | { error: string };

const TEXT_FIELDS = [
  "title",
  "description",
  "category",
  "audience",
  "platform",
  "tone",
  "variables",
  "body",
  "author",
  "slug",
] as const;

const NUMBER_FIELDS = ["rating", "monthlyUsage"] as const;

const BOOLEAN_FIELDS = ["favorite"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readTextField(
  payload: Record<string, unknown>,
  field: (typeof TEXT_FIELDS)[number],
): string | undefined {
  const value = payload[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readNumberField(
  payload: Record<string, unknown>,
  field: (typeof NUMBER_FIELDS)[number],
): number | undefined {
  const value = payload[field];
  if (value === undefined) return undefined;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readBooleanField(
  payload: Record<string, unknown>,
  field: (typeof BOOLEAN_FIELDS)[number],
): boolean | undefined {
  const value = payload[field];
  if (value === undefined) return undefined;
  return typeof value === "boolean" ? value : undefined;
}

function invalidFieldMessage(field: string): string {
  return `Champ manquant ou invalide : ${field}`;
}

export function parsePromptId(value: string): number | null {
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) ? id : null;
}

export function parsePromptCreatePayload(
  payload: unknown,
  now: string,
): ParseResult<NewPrompt> {
  if (!isRecord(payload)) {
    return { error: "Payload JSON invalide" };
  }

  const title = readTextField(payload, "title");
  if (!title) return { error: invalidFieldMessage("title") };

  const description = readTextField(payload, "description");
  if (!description) return { error: invalidFieldMessage("description") };

  const category = readTextField(payload, "category");
  if (!category) return { error: invalidFieldMessage("category") };

  const audience = readTextField(payload, "audience");
  if (!audience) return { error: invalidFieldMessage("audience") };

  const platform = readTextField(payload, "platform");
  if (!platform) return { error: invalidFieldMessage("platform") };

  const tone = readTextField(payload, "tone");
  if (!tone) return { error: invalidFieldMessage("tone") };

  const body = readTextField(payload, "body");
  if (!body) return { error: invalidFieldMessage("body") };

  const rating = payload.rating === undefined ? 4.5 : readNumberField(payload, "rating");
  if (rating === undefined) return { error: invalidFieldMessage("rating") };

  const monthlyUsage =
    payload.monthlyUsage === undefined
      ? 0
      : readNumberField(payload, "monthlyUsage");
  if (monthlyUsage === undefined) {
    return { error: invalidFieldMessage("monthlyUsage") };
  }

  const favorite =
    payload.favorite === undefined ? false : readBooleanField(payload, "favorite");
  if (favorite === undefined) return { error: invalidFieldMessage("favorite") };

  return {
    data: {
      slug: readTextField(payload, "slug") ?? slugify(title),
      title,
      description,
      category,
      audience,
      platform,
      tone,
      rating,
      monthlyUsage,
      variables: readTextField(payload, "variables") ?? "",
      body,
      author: readTextField(payload, "author") ?? "Équipe Fonderie",
      favorite,
      createdAt: now,
      updatedAt: now,
    },
  };
}

export function parsePromptPatchPayload(
  payload: unknown,
): ParseResult<Partial<NewPrompt>> {
  if (!isRecord(payload)) {
    return { error: "Payload JSON invalide" };
  }

  const patch: Partial<NewPrompt> = {};

  for (const field of TEXT_FIELDS) {
    if (!(field in payload)) continue;
    const value = readTextField(payload, field);
    if (value === undefined) return { error: invalidFieldMessage(field) };
    patch[field] = field === "slug" ? slugify(value) : value;
  }

  for (const field of NUMBER_FIELDS) {
    if (!(field in payload)) continue;
    const value = readNumberField(payload, field);
    if (value === undefined) return { error: invalidFieldMessage(field) };
    patch[field] = value;
  }

  for (const field of BOOLEAN_FIELDS) {
    if (!(field in payload)) continue;
    const value = readBooleanField(payload, field);
    if (value === undefined) return { error: invalidFieldMessage(field) };
    patch[field] = value;
  }

  if (Object.keys(patch).length === 0) {
    return { error: "Aucun champ valide à mettre à jour" };
  }

  return { data: patch };
}
