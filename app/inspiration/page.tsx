import { StudioFrame } from "@/components/studio-frame";
import { listCreativeReferences } from "@/lib/data/inspiration";

import { InspirationBoard } from "./inspiration-client";

export default function InspirationPage() {
  return (
    <StudioFrame>
      <InspirationBoard references={listCreativeReferences()} />
    </StudioFrame>
  );
}
