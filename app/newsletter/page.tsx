import { NewsletterBuilder } from "@/components/newsletter-builder";
import { StudioFrame } from "@/components/studio-frame";
import { listNewsletterDrafts } from "@/lib/newsletter-db";

export const dynamic = "force-dynamic";

export default function NewsletterPage() {
  const drafts = listNewsletterDrafts();

  return (
    <StudioFrame>
      <NewsletterBuilder initialDrafts={drafts} />
    </StudioFrame>
  );
}
