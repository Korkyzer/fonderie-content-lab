import {
  CONTENT_TYPES,
  DEFAULT_GENERATOR_INPUT,
  type ContentGenerationInput,
  type ContentType,
} from "@/lib/content-generator";

type SearchParamValue = string | string[] | undefined;

export function resolveGeneratorPrefill(searchParams?: Record<string, SearchParamValue>) {
  const title = firstValue(searchParams?.title);
  const platform = firstValue(searchParams?.platform);
  const body = firstValue(searchParams?.body);
  const audience = firstValue(searchParams?.audience);
  const goal = firstValue(searchParams?.goal);
  const tone = firstValue(searchParams?.tone);
  const angle = firstValue(searchParams?.angle);
  const contentType = readContentType(firstValue(searchParams?.contentType));

  const autoRun = [title, platform, body, audience, goal, tone, angle, contentType].some(
    (value) => Boolean(value?.trim()),
  );

  const initialInput: ContentGenerationInput = {
    contentType: contentType ?? inferContentType(platform, title),
    audience: audience?.trim() || DEFAULT_GENERATOR_INPUT.audience,
    goal: goal?.trim() || body?.trim() || DEFAULT_GENERATOR_INPUT.goal,
    tone: tone?.trim() || inferTone(platform) || DEFAULT_GENERATOR_INPUT.tone,
    angle: angle?.trim() || title?.trim() || DEFAULT_GENERATOR_INPUT.angle,
  };

  return { autoRun, initialInput };
}

function readContentType(value?: string): ContentType | null {
  if (!value) {
    return null;
  }

  return (CONTENT_TYPES as readonly string[]).includes(value) ? (value as ContentType) : null;
}

function inferContentType(platform?: string, title?: string): ContentType {
  const context = `${platform ?? ""} ${title ?? ""}`.toLowerCase();

  if (context.includes("linkedin") || context.includes("instagram") || context.includes("social")) {
    return "post social";
  }

  if (context.includes("email") || context.includes("newsletter")) {
    return "email de recrutement";
  }

  if (context.includes("web") || context.includes("landing") || context.includes("page")) {
    return "page web";
  }

  return DEFAULT_GENERATOR_INPUT.contentType;
}

function inferTone(platform?: string): string | null {
  if (!platform) {
    return null;
  }

  const normalized = platform.toLowerCase();
  if (normalized.includes("linkedin") || normalized.includes("instagram")) {
    return "direct et conversationnel";
  }

  if (normalized.includes("email")) {
    return "personnalisé et rassurant";
  }

  if (normalized.includes("web")) {
    return "éditorial";
  }

  return null;
}

function firstValue(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
