import { CampaignClient } from "./campaign-client";

import { listCampaignKits, listTemplates } from "@/lib/data/templates";

export const dynamic = "force-dynamic";

export default function CampaignGeneratorPage() {
  const templates = listTemplates(false);
  const recentKits = listCampaignKits(8);
  return <CampaignClient templates={templates} recentKits={recentKits} />;
}
