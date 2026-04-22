import { desc } from "drizzle-orm";

import { CompetitiveView } from "@/components/screens/competitive/competitive-view";
import { db } from "@/db/index";
import { competitors } from "@/db/schema";

export const dynamic = "force-dynamic";

export default function CompetitivePage() {
  const records = db
    .select()
    .from(competitors)
    .orderBy(desc(competitors.monthlyPosts))
    .all();

  return <CompetitiveView competitors={records} />;
}
