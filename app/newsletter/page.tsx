import { NewsletterBuilder } from "@/components/newsletter-builder";
import { listNewsletterDrafts } from "@/lib/newsletter-db";

export const dynamic = "force-dynamic";

export default function NewsletterPage() {
  const drafts = listNewsletterDrafts();

  return <NewsletterBuilder initialDrafts={drafts} />;
}
