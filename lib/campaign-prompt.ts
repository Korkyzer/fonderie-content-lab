import type { CampaignKitItem } from "@/lib/data/templates";

export type CampaignGenerateRequest = {
  objective: string;
  formation?: string;
  eventName?: string;
  audiences: string[];
  platforms: string[];
};

const CFI_CONTEXT = `Tu écris pour le Campus Fonderie de l'Image (CFI), école supérieure privée à Bagnolet (93).
Identité visuelle: violet signature #AE64DE, typographie SVHFlib, esthétique éditoriale, ton accessible mais pro.
Évite le jargon corporate. Parle vrai, avec chaleur, comme une école qui montre ses ateliers.
Jamais de mots "IA", "Claude", "GPT", "intelligence artificielle" dans les contenus produits.
Respecte l'orthographe française avec accents (é, è, à, ç, ù, ê...). Pas d'em dash ni en dash.`;

const SCHEMA_DOC = `Rends STRICTEMENT un JSON valide (sans markdown, sans préambule) avec cette forme:
{
  "items": [
    {
      "platform": "Instagram Reel" | "Instagram Story" | "Instagram Carrousel" | "LinkedIn" | "TikTok" | "Email",
      "persona": "string court — l'audience visée par cette pièce",
      "format": "string court — ex: Reel 30s, Carrousel 5 slides, Email 4 blocs",
      "title": "string — titre interne de la pièce",
      "body": "string — contenu rédigé prêt à publier (200-600 caractères selon plateforme)",
      "hashtags": ["#Tag1", ...] (vide pour Email/LinkedIn long format),
      "cta": "string — call to action concret",
      "duration": "string optionnel — durée ou format",
      "notes": "string optionnel — angle, recommandation visuelle"
    }
  ]
}
Crée exactement une pièce par combinaison plateforme x audience demandée. Diversifie les angles.`;

export function buildCampaignMessages(request: CampaignGenerateRequest): Array<{
  role: "system" | "user";
  content: string;
}> {
  const audiencesLine = request.audiences.length > 0 ? request.audiences.join(", ") : "Lycéens 16-20";
  const platformsLine = request.platforms.length > 0 ? request.platforms.join(", ") : "Instagram Reel, LinkedIn, Email";
  const formationLine = request.formation ? `Formation mise en avant: ${request.formation}` : "";
  const eventLine = request.eventName ? `Événement / temps fort: ${request.eventName}` : "";

  const system = `${CFI_CONTEXT}

Tu génères un kit de campagne 360 multi-plateforme.
Chaque pièce doit s'inscrire dans la même intention mais s'adapter au format, au ton et à la culture de la plateforme.
Adapte le ton au persona (Lycéens = direct aspirationnel; Parents = rassurant pédagogique; Entreprises = ROI compétences; Alumni = fierté communauté).

${SCHEMA_DOC}`;

  const user = `Objectif de campagne:
"""
${request.objective}
"""

Plateformes ciblées: ${platformsLine}
Audiences ciblées: ${audiencesLine}
${formationLine}
${eventLine}

Génère le kit complet au format JSON demandé.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

export function parseCampaignItemsJSON(raw: string): CampaignKitItem[] | null {
  const cleaned = stripJSONFences(raw).trim();
  if (!cleaned) return null;
  try {
    const parsed = JSON.parse(cleaned) as { items?: unknown };
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) return null;
    const items = parsed.items
      .map(normalizeItem)
      .filter((item): item is CampaignKitItem => item !== null);
    return items.length > 0 ? items : null;
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

function normalizeItem(raw: unknown): CampaignKitItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const platform = typeof r.platform === "string" ? r.platform.trim() : null;
  const persona = typeof r.persona === "string" ? r.persona.trim() : null;
  const format = typeof r.format === "string" ? r.format.trim() : "";
  const title = typeof r.title === "string" ? r.title.trim() : null;
  const body = typeof r.body === "string" ? r.body.trim() : null;
  const cta = typeof r.cta === "string" ? r.cta.trim() : "";
  const hashtags = Array.isArray(r.hashtags)
    ? r.hashtags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const duration = typeof r.duration === "string" ? r.duration.trim() : undefined;
  const notes = typeof r.notes === "string" ? r.notes.trim() : undefined;
  if (!platform || !persona || !title || !body) return null;
  return { platform, persona, format, title, body, cta, hashtags, duration, notes };
}

export function buildMockKit(request: CampaignGenerateRequest): CampaignKitItem[] {
  const audiences = request.audiences.length > 0 ? request.audiences : ["Lycéens 16-20"];
  const platforms = request.platforms.length > 0 ? request.platforms : ["Instagram Reel", "LinkedIn", "Email"];
  const items: CampaignKitItem[] = [];

  platforms.forEach((platform) => {
    audiences.forEach((audience) => {
      items.push({
        platform,
        persona: audience,
        format: defaultFormat(platform),
        title: `${platform} · ${audience} · ${truncate(request.objective, 38)}`,
        body: mockBody(platform, audience, request),
        hashtags: defaultHashtags(platform, request),
        cta: defaultCTA(platform, request),
        duration: defaultDuration(platform),
        notes: "Variante mock - configure REQUESTY_API_KEY pour la version Requesty.",
      });
    });
  });

  return items;
}

function defaultFormat(platform: string): string {
  if (platform.includes("Reel")) return "Reel vertical 30s";
  if (platform.includes("Story")) return "3 stories x 8s";
  if (platform.includes("Carrousel")) return "Carrousel 5 slides";
  if (platform === "TikTok") return "TikTok 30s";
  if (platform === "LinkedIn") return "Post 3 paragraphes";
  if (platform === "Email") return "Email 3 blocs";
  return "Post";
}

function defaultDuration(platform: string): string {
  if (platform.includes("Reel") || platform === "TikTok") return "30s";
  if (platform.includes("Story")) return "3 x 8s";
  if (platform === "Email") return "Lecture 1 min";
  return "Post";
}

function defaultHashtags(platform: string, request: CampaignGenerateRequest): string[] {
  if (platform === "Email" || platform === "LinkedIn") return [];
  const base = ["#FonderieDeLImage"];
  if (request.eventName) base.push(`#${slugTag(request.eventName)}`);
  if (request.formation) base.push(`#${slugTag(request.formation)}`);
  base.push("#EcoleCreative", "#Bagnolet");
  return Array.from(new Set(base)).slice(0, 6);
}

function defaultCTA(platform: string, request: CampaignGenerateRequest): string {
  if (request.eventName?.toLowerCase().includes("jpo")) {
    return platform === "Email"
      ? "Réservez votre créneau JPO sur fonderie-image.org/jpo"
      : "Inscris-toi à la JPO sur fonderie-image.org";
  }
  return platform === "Email"
    ? "Découvrir le programme sur fonderie-image.org"
    : "Plus d'infos sur fonderie-image.org";
}

function mockBody(platform: string, audience: string, request: CampaignGenerateRequest) {
  const objective = request.objective.trim();
  const event = request.eventName ? ` ${request.eventName}.` : "";
  if (platform === "Email") {
    return `Bonjour, voici un aperçu de ce qu'on prépare à la Fonderie pour ${objective}.${event} Pour ${audience.toLowerCase()}, on souligne ce qui compte vraiment : projets concrets, accompagnement et réseau actif.`;
  }
  if (platform === "LinkedIn") {
    return `À la Fonderie, on prépare ${objective}.${event} Pour notre cible ${audience}, voici les 3 choses qu'on retient : 1) du concret 2) un accompagnement humain 3) un réseau qui ouvre des portes.`;
  }
  if (platform === "TikTok" || platform.includes("Reel")) {
    return `Hook : ${truncate(objective, 60)}. Plan rapide ateliers, étudiant·e qui parle vrai, dernier plan logo CFI. Adapté à ${audience}.`;
  }
  return `Story / Carrousel pour ${audience} sur ${truncate(objective, 80)}.${event}`;
}

function slugTag(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "")
    .slice(0, 24) || "Fonderie";
}

function truncate(input: string, max: number): string {
  return input.length > max ? `${input.slice(0, max - 1)}…` : input;
}

export function slugifyCampaignObjective(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64);
}
