// Auto-publish channel registry. Hooks are placeholders today: the UI exposes
// status + connection metadata, and `publishContent()` returns a no-op result
// flagged "Non connecté". Wire each handler to the real provider SDK
// (Meta Graph API, LinkedIn API, TikTok API, Mailjet) when credentials land.

export type PublishChannelKey =
  | "instagram"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "email";

export type PublishChannel = {
  key: PublishChannelKey;
  label: string;
  provider: string;
  status: "not_connected" | "connected" | "error";
  capabilities: string[];
  notes: string;
};

export const AUTO_PUBLISH_CHANNELS: PublishChannel[] = [
  {
    key: "instagram",
    label: "Instagram",
    provider: "Meta Graph API",
    status: "not_connected",
    capabilities: ["Feed", "Story", "Reel"],
    notes: "Nécessite un compte Meta Business + Page Facebook liée à l'Instagram pro CFI.",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    provider: "LinkedIn Marketing API",
    status: "not_connected",
    capabilities: ["Post page", "Article"],
    notes: "OAuth admin de la page Campus Fonderie de l'Image requis.",
  },
  {
    key: "tiktok",
    label: "TikTok",
    provider: "TikTok Content Posting API",
    status: "not_connected",
    capabilities: ["Vidéo", "Spark Ads"],
    notes: "Compte TikTok Business + validation manuelle du domaine.",
  },
  {
    key: "youtube",
    label: "YouTube",
    provider: "YouTube Data API v3",
    status: "not_connected",
    capabilities: ["Short", "Vidéo longue"],
    notes: "Compte de service Google + chaîne CFI vérifiée.",
  },
  {
    key: "email",
    label: "Newsletter alumni",
    provider: "Mailjet",
    status: "not_connected",
    capabilities: ["Campagne", "Segment"],
    notes: "Clé API Mailjet + liste d'envoi alumni.",
  },
];

export type ContentPublishStatus =
  | "draft"
  | "scheduled"
  | "queued"
  | "published"
  | "failed";

export const CONTENT_STATUS_FLOW: ContentPublishStatus[] = [
  "draft",
  "scheduled",
  "queued",
  "published",
];

export const CONTENT_STATUS_LABEL: Record<ContentPublishStatus, string> = {
  draft: "Brouillon",
  scheduled: "Planifié",
  queued: "En attente publication",
  published: "Publié",
  failed: "Échec",
};

export const CONTENT_STATUS_TONE: Record<ContentPublishStatus, string> = {
  draft: "bg-ink/10 text-ink",
  scheduled: "bg-sky text-ink",
  queued: "bg-yellow text-ink",
  published: "bg-green text-ink",
  failed: "bg-red text-cream",
};

export type PublishResult =
  | { ok: true; channel: PublishChannelKey; remoteId: string }
  | { ok: false; channel: PublishChannelKey; reason: string };

// Placeholder hook. Replace per-channel cases when SDKs are wired.
export async function publishContent(
  channel: PublishChannelKey,
  _payload: Record<string, unknown>,
): Promise<PublishResult> {
  return {
    ok: false,
    channel,
    reason: "Non connecté · brancher l'API du canal pour activer la publication.",
  };
}
