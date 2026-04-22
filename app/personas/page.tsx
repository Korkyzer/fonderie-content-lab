import { PersonasExplorer } from "./personas-client";

import { listPersonas } from "@/lib/data/personas";

export const dynamic = "force-dynamic";

export default function PersonasPage() {
  const personas = listPersonas();
  return <PersonasExplorer personas={personas} />;
}
