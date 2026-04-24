import { spawnSync } from "node:child_process";

const filters = process.argv.slice(2);
const testFiles =
  filters.length === 0 || filters.includes("generator")
    ? ["tests/generator-route.test.ts"]
    : filters;

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...testFiles],
  { stdio: "inherit" },
);

process.exit(result.status ?? 1);
