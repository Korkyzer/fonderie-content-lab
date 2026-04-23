import { listCreativeReferences } from "@/lib/data/inspiration";

import { InspirationBoard } from "./inspiration-client";

export const dynamic = "force-dynamic";

export default function InspirationPage() {
  return <InspirationBoard references={listCreativeReferences()} />;
}
