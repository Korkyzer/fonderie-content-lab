import { PromptsLibrary } from "./prompts-client";

import { listPrompts } from "@/lib/data/prompts";

export const dynamic = "force-dynamic";

export default function PromptsPage() {
  const prompts = listPrompts();
  return <PromptsLibrary prompts={prompts} />;
}
