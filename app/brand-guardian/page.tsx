import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { db } from "@/db/index";
import { brandRules as brandRulesTable } from "@/db/schema";
import {
  createBrandAnalysisResponse,
  type BrandAnalysisResponse,
} from "@/lib/brand-guardian-mock";
import { fallbackBrandRules } from "@/lib/fallback-data";

import { GuardianClient } from "./guardian-client";

export default function BrandGuardianPage() {
  const initialAnalysis: BrandAnalysisResponse = createBrandAnalysisResponse();

  const brandRuleRows = (() => {
    try {
      const rows = db
        .select({
          id: brandRulesTable.id,
          category: brandRulesTable.category,
          name: brandRulesTable.name,
          description: brandRulesTable.description,
          severity: brandRulesTable.severity,
          expectedValue: brandRulesTable.expectedValue,
        })
        .from(brandRulesTable)
        .all();

      return rows.length > 0 ? rows : fallbackBrandRules;
    } catch {
      return fallbackBrandRules;
    }
  })();

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        eyebrow="Brand Guardian"
        title="Analyse · Carrousel Motion Design"
        description="Contrôle de conformité éditoriale, accessibilité et respect de la palette CFI."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="purple">Score {initialAnalysis.score}/100</Badge>
        <Badge tone="yellow">Jaune off-brand</Badge>
        <Badge tone="green">Correction +{initialAnalysis.suggestion.gain} pts</Badge>
        <span className="mx-2 h-4 w-px bg-ink/15" />
        <Button variant="light" icon={<Icon name="close" size={14} />}>
          Renvoyer
        </Button>
        <Button variant="primary" icon={<Icon name="check" size={14} />}>
          Approuver
        </Button>
      </div>

      <GuardianClient initial={initialAnalysis} brandRules={brandRuleRows} />
    </div>
  );
}
