import type { GenerateRequest } from "@/lib/generator-mock";

const CFI_CONTEXT = `Tu écris pour le Campus Fonderie de l'Image (CFI), école supérieure privée à Bagnolet (93).
Formations phares: Design Graphique, Motion Design, Direction Artistique, Sérigraphie, DCDG, BTS et Mastères.
Identité visuelle: violet signature #AE64DE, typographie SVHFlib, esthétique éditoriale, ton accessible mais pro.
Évite le jargon corporate. Parle vrai, avec chaleur, comme une école qui montre ses ateliers.
Jamais de mots "IA", "Claude", "GPT", "intelligence artificielle" dans les contenus produits.
Respecte l'orthographe française avec accents (é, è, à, ç, ù, ê...). Pas d'em dash ni en dash.`;

const JSON_SCHEMA_DOC = `Rends STRICTEMENT un JSON valide (sans bloc markdown, sans préambule) avec cette forme:
{
  "variants": [
    {
      "id": "A",
      "hook": "string court, max 40 caractères, percutant",
      "caption": "string, caption complète pour la plateforme, 200-400 caractères",
      "hashtags": ["#Tag1", "#Tag2", ...] (5 à 7 hashtags pertinents, #FonderieDeLImage obligatoire)
    },
    { "id": "B", ... },
    { "id": "C", ... }
  ]
}
Les 3 variantes doivent avoir des angles distincts (ex: émotionnel, factuel, créatif).`;

export function buildGeneratorMessages(request: GenerateRequest): Array<{
  role: "system" | "user";
  content: string;
}> {
  const system = `${CFI_CONTEXT}

Cible pour ce contenu:
- Persona: ${request.persona}
- Plateforme: ${request.platform}
- Formation mise en avant: ${request.formation}
- Style visuel associé: ${request.visualStyle}
- Ton éditorial: ${request.tone}
- Durée / format cible: ${request.duration}

Ta mission: produire 3 variantes de contenu éditorial pour cette campagne CFI.
Adapte le vocabulaire à la plateforme (Instagram = émotion + hashtags; LinkedIn = crédibilité pro; TikTok = punch direct; Email = proximité structurée).
Adapte le ton au persona (Lycéens = direct, aspirationnel; Parents = rassurant, pédagogique; Entreprises = ROI, compétences; Alumni = fierté, communauté).

${JSON_SCHEMA_DOC}`;

  const user = `Brief à transformer en contenu:
"""
${request.brief}
"""

Génère les 3 variantes au format JSON demandé.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

type ParsedVariant = { id: string; hook: string; caption: string; hashtags: string[] };

export function parseVariantsJSON(raw: string): ParsedVariant[] | null {
  const cleaned = stripJSONFences(raw).trim();
  if (!cleaned) return null;

  try {
    const parsed = JSON.parse(cleaned) as { variants?: unknown };
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.variants)) {
      return null;
    }
    const variants = parsed.variants
      .map(normalizeVariant)
      .filter((v): v is ParsedVariant => v !== null);
    return variants.length === 3 ? variants : variants.length > 0 ? variants : null;
  } catch {
    return null;
  }
}

function stripJSONFences(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1];
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  return text;
}

function normalizeVariant(raw: unknown): ParsedVariant | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id.toUpperCase() : null;
  const hook = typeof r.hook === "string" ? r.hook.trim() : null;
  const caption = typeof r.caption === "string" ? r.caption.trim() : null;
  const hashtags = Array.isArray(r.hashtags)
    ? r.hashtags.filter((t): t is string => typeof t === "string")
    : null;
  if (!id || !hook || !caption || !hashtags) return null;
  return { id, hook, caption, hashtags };
}
