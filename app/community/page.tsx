import {
  listAlumniProfiles,
  listAlumniTestimonials,
  listCommunityOpportunities,
  listPartners,
} from "@/lib/data/community";

import { CommunityHub } from "./community-client";

export const dynamic = "force-dynamic";

export default function CommunityPage() {
  return (
    <CommunityHub
      alumni={listAlumniProfiles()}
      partners={listPartners()}
      opportunities={listCommunityOpportunities()}
      testimonials={listAlumniTestimonials()}
    />
  );
}
