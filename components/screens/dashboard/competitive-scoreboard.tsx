"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import type { ScoreboardRow, ScoreboardTrendPoint } from "@/lib/queries";
import { cx } from "@/lib/utils";

type CompetitiveScoreboardProps = {
  rows: ScoreboardRow[];
  trend: ScoreboardTrendPoint[];
  latestWeek: string | null;
};

const BAR_COLORS: Record<string, string> = {
  CFI: "#AE64DE",
  Gobelins: "#80D3FF",
  LISAA: "#FF9E5C",
  ECV: "#4FB87C",
  Cifacom: "#F291C7",
};

const LINE_COLORS: Record<string, string> = {
  cfi: "#AE64DE",
  gobelins: "#80D3FF",
  lisaa: "#FF9E5C",
  ecv: "#4FB87C",
  cifacom: "#F291C7",
};

const LINE_KEYS: Array<{ key: keyof ScoreboardTrendPoint; label: string }> = [
  { key: "cfi", label: "CFI" },
  { key: "gobelins", label: "Gobelins" },
  { key: "lisaa", label: "LISAA" },
  { key: "ecv", label: "ECV" },
  { key: "cifacom", label: "Cifacom" },
];

function formatWeek(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.valueOf())) return iso;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function rankBadge(index: number): string {
  if (index === 0) return "#1";
  if (index === 1) return "#2";
  if (index === 2) return "#3";
  return `#${index + 1}`;
}

export function CompetitiveScoreboard({ rows, trend, latestWeek }: CompetitiveScoreboardProps) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader title="Scoreboard d'engagement" />
        <p className="text-[13px] text-ink/70">
          Pas de métriques disponibles. Lance le seed pour initialiser les données.
        </p>
      </Card>
    );
  }

  const barData = rows.map((row) => ({
    label: row.label,
    Instagram: row.instagramEngagement,
    LinkedIn: row.linkedinEngagement,
    TikTok: row.tiktokEngagement,
  }));

  const trendData = trend.map((point) => ({ ...point, weekLabel: formatWeek(point.weekStart) }));

  return (
    <Card>
      <CardHeader
        title="Scoreboard d'engagement"
        more={
          latestWeek ? (
            <Badge tone="outline">Semaine du {formatWeek(latestWeek)}</Badge>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/55">
            Engagement moyen par plateforme (%)
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(29,29,27,0.08)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fontWeight: 700, fill: "#1D1D1B" }}
                  axisLine={{ stroke: "rgba(29,29,27,0.2)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "rgba(29,29,27,0.6)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 6,
                    border: "1px solid rgba(29,29,27,0.15)",
                    fontSize: 12,
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Instagram" fill="#AE64DE" radius={[3, 3, 0, 0]} />
                <Bar dataKey="LinkedIn" fill="#80D3FF" radius={[3, 3, 0, 0]} />
                <Bar dataKey="TikTok" fill="#FF9E5C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/55">
            Tendance engagement · 4 dernières semaines
          </p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(29,29,27,0.08)" />
                <XAxis
                  dataKey="weekLabel"
                  tick={{ fontSize: 11, fill: "rgba(29,29,27,0.6)" }}
                  axisLine={{ stroke: "rgba(29,29,27,0.2)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "rgba(29,29,27,0.6)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 6,
                    border: "1px solid rgba(29,29,27,0.15)",
                    fontSize: 12,
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {LINE_KEYS.map(({ key, label }) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={label}
                    stroke={LINE_COLORS[key]}
                    strokeWidth={key === "cfi" ? 3 : 2}
                    dot={{ r: key === "cfi" ? 4 : 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/55">
            Classement composite
          </p>
          <ol className="flex flex-col gap-2">
            {rows.map((row, index) => {
              const cfi = row.isCfi;
              const color = BAR_COLORS[row.label] ?? "#AE64DE";
              return (
                <li
                  key={row.handle}
                  className={cx(
                    "flex items-center gap-3 rounded-md border p-3",
                    cfi
                      ? "border-purple bg-purple/10"
                      : "border-ink/10 bg-white",
                  )}
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-ink text-[13px] font-bold uppercase"
                    style={{ background: color }}
                  >
                    {rankBadge(index)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-bold uppercase tracking-[0.02em]">
                        {row.label}
                      </span>
                      {cfi ? <Badge tone="purple">Nous</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/55">
                      IG {row.instagramEngagement}% · LI {row.linkedinEngagement}% · TK {row.tiktokEngagement}%
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/55">
                      Portée {row.reach.toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <span className="text-[18px] font-bold leading-none text-ink">
                    {row.compositeScore}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Card>
  );
}
