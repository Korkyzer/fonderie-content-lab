import { TemplatesClient } from "./templates-client";

import { listTemplates } from "@/lib/data/templates";

export const dynamic = "force-dynamic";

export default function TemplatesPage() {
  const templates = listTemplates(true);
  return <TemplatesClient initialTemplates={templates} />;
}
