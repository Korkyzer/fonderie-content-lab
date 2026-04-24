import { slugify, type NewPrompt } from "@/lib/data/prompts";

type ParseResult<T> = { data: T } | { error: string };

const REQUIRED_TEXT_FIELDS = [
  "title",
  "description",
  "category",
  "audience",
  "platform",
  "tone",
  "body",
] as const;

const INTEGER_FIELDS = ["monthlyUsage"] as const;

const BOOLEAN_FIELDS = ["favorite"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readOptionalTextField(
  payload: Record<string, unknown>,
  field: string,
): string | null | undefined {
  const value = payload[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string") return null;
  return value.trim();
}

function readRequiredTextField(
  payload: Record<string, unknown>,
  field: (typeof REQUIRED_TEXT_FIELDS)[number],
): string | undefined {
  const value = readOptionalTextField(payload, field);
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readRatingField(
  payload: Record<string, unknown>,
  field: "rating",
): number | undefined {
  const value = payload[field];
  if (value === undefined) return undefined;
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 5
    ? value
    : undefined;
}

function readIntegerField(
  payload: Record<string, unknown>,
  field: (typeof INTEGER_FIELDS)[number],
): number | undefined {
  const value = payload[field];
  if (value === undefined) return undefined;
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : undefined;
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
  if (!/^[1-9]\d*$/.test(value)) return null;
  return Number.parseInt(value, 10);
}

export function parsePromptCreatePayload(
  payload: unknown,
  now: string,
): ParseResult<NewPrompt> {
  if (!isRecord(payload)) {
    return { error: "Payload JSON invalide" };
  }

  const title = readRequiredTextField(payload, "title");
  if (!title) return { error: invalidFieldMessage("title") };

  const description = readRequiredTextField(payload, "description");
  if (!description) return { error: invalidFieldMessage("description") };

  const category = readRequiredTextField(payload, "category");
  if (!category) return { error: invalidFieldMessage("category") };

  const audience = readRequiredTextField(payload, "audience");
  if (!audience) return { error: invalidFieldMessage("audience") };

  const platform = readRequiredTextField(payload, "platform");
  if (!platform) return { error: invalidFieldMessage("platform") };

  const tone = readRequiredTextField(payload, "tone");
  if (!tone) return { error: invalidFieldMessage("tone") };

  const body = readRequiredTextField(payload, "body");
  if (!body) return { error: invalidFieldMessage("body") };

  const rating =
    payload.rating === undefined ? 4.5 : readRatingField(payload, "rating");
  if (rating === undefined) return { error: invalidFieldMessage("rating") };

  const monthlyUsage =
    payload.monthlyUsage === undefined ? 0 : readIntegerField(payload, "monthlyUsage");
  if (monthlyUsage === undefined) {
    return { error: invalidFieldMessage("monthlyUsage") };
  }

  const favorite =
    payload.favorite === undefined ? false : readBooleanField(payload, "favorite");
  if (favorite === undefined) return { error: invalidFieldMessage("favorite") };

  const rawSlug = readOptionalTextField(payload, "slug");
  if ("slug" in payload && (!rawSlug || rawSlug.length === 0)) {
    return { error: invalidFieldMessage("slug") };
  }

  const rawAuthor = readOptionalTextField(payload, "author");
  if ("author" in payload && (!rawAuthor || rawAuthor.length === 0)) {
    return { error: invalidFieldMessage("author") };
  }

  const rawVariables = readOptionalTextField(payload, "variables");
  if ("variables" in payload && rawVariables === null) {
    return { error: invalidFieldMessage("variables") };
  }

  const slug = slugify(rawSlug && rawSlug.length > 0 ? rawSlug : title);
  if (!slug) return { error: invalidFieldMessage("slug") };

  return {
    data: {
      slug,
      title,
      description,
      category,
      audience,
      platform,
      tone,
      rating,
      monthlyUsage,
      variables: rawVariables ?? "",
      body,
      author: rawAuthor ?? "Équipe Fonderie",
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

  for (const field of REQUIRED_TEXT_FIELDS) {
    if (!(field in payload)) continue;
    const value = readOptionalTextField(payload, field);
    if (!value || value.length === 0) return { error: invalidFieldMessage(field) };
    patch[field] = value;
  }

  if ("author" in payload) {
    const value = readOptionalTextField(payload, "author");
    if (!value || value.length === 0) {
      return { error: invalidFieldMessage("author") };
    }
    patch.author = value;
  }

  if ("slug" in payload) {
    const value = readOptionalTextField(payload, "slug");
    if (!value || value.length === 0) {
      return { error: invalidFieldMessage("slug") };
    }

    const slug = slugify(value);
    if (!slug) return { error: invalidFieldMessage("slug") };
    patch.slug = slug;
  }

  if ("variables" in payload) {
    const value = readOptionalTextField(payload, "variables");
    if (value === undefined || value === null) {
      return { error: invalidFieldMessage("variables") };
    }
    patch.variables = value;
  }

  if ("rating" in payload) {
    const value = readRatingField(payload, "rating");
    if (value === undefined) return { error: invalidFieldMessage("rating") };
    patch.rating = value;
  }

  for (const field of INTEGER_FIELDS) {
    if (!(field in payload)) continue;
    const value = readIntegerField(payload, field);
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
