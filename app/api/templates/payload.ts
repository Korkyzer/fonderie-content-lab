import {
  slugifyTemplateName,
  type NewTemplate,
} from "@/lib/data/templates";

const VALID_KINDS = ["formation", "event", "audience", "general"] as const;
type Kind = (typeof VALID_KINDS)[number];

type ParseResult<T> = { data: T } | { error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readText(payload: Record<string, unknown>, field: string): string | undefined {
  const value = payload[field];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readOptionalText(payload: Record<string, unknown>, field: string): string | null | undefined {
  if (!(field in payload)) return undefined;
  const value = payload[field];
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readKind(payload: Record<string, unknown>): Kind | undefined {
  const value = payload.kind;
  if (typeof value !== "string") return undefined;
  return (VALID_KINDS as readonly string[]).includes(value) ? (value as Kind) : undefined;
}

function readStringList(payload: Record<string, unknown>, field: string): string[] | undefined {
  const value = payload[field];
  if (!Array.isArray(value)) return undefined;
  const cleaned = value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  return cleaned;
}

function readBoolean(payload: Record<string, unknown>, field: string): boolean | undefined {
  const value = payload[field];
  if (typeof value !== "boolean") return undefined;
  return value;
}

function invalid(field: string): string {
  return `Champ manquant ou invalide : ${field}`;
}

export function parseTemplateCreatePayload(
  payload: unknown,
  now: string,
): ParseResult<NewTemplate> {
  if (!isRecord(payload)) return { error: "Payload JSON invalide" };

  const name = readText(payload, "name");
  if (!name) return { error: invalid("name") };

  const description = readText(payload, "description");
  if (!description) return { error: invalid("description") };

  const kind = readKind(payload);
  if (!kind) return { error: invalid("kind") };

  const platform = readText(payload, "platform");
  if (!platform) return { error: invalid("platform") };

  const tone = readText(payload, "tone");
  if (!tone) return { error: invalid("tone") };

  const visualStyle = readText(payload, "visualStyle");
  if (!visualStyle) return { error: invalid("visualStyle") };

  const duration = readText(payload, "duration");
  if (!duration) return { error: invalid("duration") };

  const cta = readText(payload, "cta");
  if (!cta) return { error: invalid("cta") };

  const briefSeed = readText(payload, "briefSeed");
  if (!briefSeed) return { error: invalid("briefSeed") };

  const structure = readStringList(payload, "structure");
  if (!structure || structure.length === 0) return { error: invalid("structure") };

  const assets = readStringList(payload, "assets") ?? [];

  const formation = readOptionalText(payload, "formation");
  const eventName = readOptionalText(payload, "eventName");
  const audience = readOptionalText(payload, "audience");

  const slugInput = readText(payload, "slug") ?? name;
  const slug = slugifyTemplateName(slugInput);
  if (!slug) return { error: invalid("slug") };

  return {
    data: {
      slug,
      name,
      description,
      kind,
      formation: formation === undefined ? null : formation,
      eventName: eventName === undefined ? null : eventName,
      audience: audience === undefined ? null : audience,
      platform,
      tone,
      visualStyle,
      duration,
      cta,
      structure: JSON.stringify(structure),
      assets: JSON.stringify(assets),
      briefSeed,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
  };
}

export function parseTemplatePatchPayload(payload: unknown): ParseResult<Partial<NewTemplate>> {
  if (!isRecord(payload)) return { error: "Payload JSON invalide" };

  const patch: Partial<NewTemplate> = {};

  const textFields: Array<keyof Pick<
    NewTemplate,
    "name" | "description" | "platform" | "tone" | "visualStyle" | "duration" | "cta" | "briefSeed"
  >> = ["name", "description", "platform", "tone", "visualStyle", "duration", "cta", "briefSeed"];

  for (const field of textFields) {
    if (!(field in payload)) continue;
    const value = readText(payload, field);
    if (!value) return { error: invalid(field) };
    patch[field] = value;
  }

  if ("kind" in payload) {
    const kind = readKind(payload);
    if (!kind) return { error: invalid("kind") };
    patch.kind = kind;
  }

  for (const field of ["formation", "eventName", "audience"] as const) {
    if (!(field in payload)) continue;
    const value = readOptionalText(payload, field);
    if (value === undefined) return { error: invalid(field) };
    patch[field] = value;
  }

  if ("structure" in payload) {
    const list = readStringList(payload, "structure");
    if (!list || list.length === 0) return { error: invalid("structure") };
    patch.structure = JSON.stringify(list);
  }

  if ("assets" in payload) {
    const list = readStringList(payload, "assets");
    if (!list) return { error: invalid("assets") };
    patch.assets = JSON.stringify(list);
  }

  if ("archived" in payload) {
    const value = readBoolean(payload, "archived");
    if (value === undefined) return { error: invalid("archived") };
    patch.archived = value;
  }

  if ("slug" in payload) {
    const slugInput = readText(payload, "slug");
    if (!slugInput) return { error: invalid("slug") };
    const slug = slugifyTemplateName(slugInput);
    if (!slug) return { error: invalid("slug") };
    patch.slug = slug;
  }

  if (Object.keys(patch).length === 0) {
    return { error: "Aucun champ valide à mettre à jour" };
  }

  return { data: patch };
}

export function parseTemplateId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  return Number.parseInt(value, 10);
}
