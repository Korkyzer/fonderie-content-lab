import { StudioFrame } from "@/components/studio-frame";
import {
  listAlumniProfiles,
  listAlumniTestimonials,
  listCommunityOpportunities,
  listPartners,
} from "@/lib/data/community";

import { CommunityHub } from "./community-client";
export default function CommunityPage() {
  return (
    <StudioFrame>
      <CommunityHub
        alumni={listAlumniProfiles()}
        partners={listPartners()}
        opportunities={listCommunityOpportunities()}
        testimonials={listAlumniTestimonials()}
      />
    </StudioFrame>
  );
}
