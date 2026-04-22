import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { db, sqlite } from "@/db/index";

migrate(db, { migrationsFolder: "./drizzle" });
sqlite.close();
