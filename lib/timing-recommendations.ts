// Timing recommendations and channel publishing metadata.
// Static dataset that mirrors what a Requesty (haiku) analysis would surface
// from historical engagement. Wire to the Requesty gateway later by replacing
// `getChannelTiming()` with a server fetch keyed on channel + persona.

export type ChannelKey = "Instagram" | "TikTok" | "LinkedIn" | "Email" | "YouTube";

export type TimingScore = "good" | "neutral" | "bad";

export type ChannelTiming = {
  channel: ChannelKey;
  bestSlots: string;
  bestHours: number[];
  bestWeekdays: number[]; // 1 = lundi … 7 = dimanche
  rationale: string;
};

export const CHANNEL_TIMING: ChannelTiming[] = [
  {
    channel: "Instagram",
    bestSlots: "Soir 18h–20h",
    bestHours: [18, 19, 20],
    bestWeekdays: [2, 3, 4, 6],
    rationale:
      "Pic d'activité des lycéens en fin de journée. Stories et Reels après 18h captent +37% d'engagement vs midi.",
  },
  {
    channel: "TikTok",
    bestSlots: "Midi 12h–13h et soir 19h–21h",
    bestHours: [12, 13, 19, 20, 21],
    bestWeekdays: [3, 4, 5, 7],
    rationale:
      "Audience 16–20 ans active pendant la pause déjeuner et après le dîner. Mercredi et dimanche dominent.",
  },
  {
    channel: "LinkedIn",
    bestSlots: "Matin 8h–10h",
    bestHours: [8, 9, 10],
    bestWeekdays: [2, 3, 4],
    rationale:
      "Décideurs et alumni consultent LinkedIn entre le café et la première réunion. Mardi/mercredi/jeudi pic.",
  },
  {
    channel: "Email",
    bestSlots: "Mardi et jeudi matin 9h–11h",
    bestHours: [9, 10, 11],
    bestWeekdays: [2, 4],
    rationale:
      "Newsletters alumni : taux d'ouverture +22% les mardi et jeudi matin. Éviter le lundi (boîte saturée).",
  },
  {
    channel: "YouTube",
    bestSlots: "Vendredi soir 18h–22h, samedi après-midi",
    bestHours: [18, 19, 20, 21, 22],
    bestWeekdays: [5, 6],
    rationale:
      "Formats long ouvrent leur fenêtre d'écoute en début de week-end. Les vidéos publiées vendredi dépassent +18% de vues à 7 jours.",
  },
];

export function getChannelTiming(channel: ChannelKey | string): ChannelTiming | undefined {
  return CHANNEL_TIMING.find((t) => t.channel === channel);
}

export function scoreSlot(
  date: Date,
  channel: ChannelKey | string,
  hour = 12,
): TimingScore {
  const timing = getChannelTiming(channel);
  if (!timing) return "neutral";
  const isoDay = ((date.getDay() + 6) % 7) + 1;
  const dayOk = timing.bestWeekdays.includes(isoDay);
  const hourOk = timing.bestHours.includes(hour);
  if (dayOk && hourOk) return "good";
  if (dayOk || hourOk) return "neutral";
  return "bad";
}

export function scoreDay(
  date: Date,
  entries: Array<{ channel: string; hour?: number }>,
): TimingScore {
  if (entries.length === 0) return "neutral";
  let good = 0;
  let bad = 0;
  for (const entry of entries) {
    const score = scoreSlot(date, entry.channel, entry.hour ?? 12);
    if (score === "good") good += 1;
    if (score === "bad") bad += 1;
  }
  if (good > 0 && good >= bad) return "good";
  if (bad > entries.length / 2) return "bad";
  return "neutral";
}

export const TIMING_TONE: Record<TimingScore, string> = {
  good: "bg-green/35",
  neutral: "bg-ink/[0.04]",
  bad: "bg-red/15",
};

export const TIMING_LABEL: Record<TimingScore, string> = {
  good: "Créneau favorable",
  neutral: "Créneau neutre",
  bad: "Créneau peu performant",
};

export type RecurrencePattern = "weekly" | "biweekly" | "monthly-first" | "monthly-last";

export type RecurrenceRule = {
  id: string;
  label: string;
  channel: ChannelKey | string;
  pattern: RecurrencePattern;
  weekday?: number;
  startDate: string;
  endDate?: string;
};

export function expandRecurrence(rule: RecurrenceRule, monthDate: Date): Date[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const start = new Date(rule.startDate);
  const end = rule.endDate ? new Date(rule.endDate) : null;
  const dates: Date[] = [];

  if (rule.pattern === "monthly-first") {
    const candidate = new Date(year, month, 1);
    if (candidate >= start && (!end || candidate <= end)) {
      dates.push(candidate);
    }
  } else if (rule.pattern === "monthly-last") {
    const candidate = new Date(year, month + 1, 0);
    if (candidate >= start && (!end || candidate <= end)) {
      dates.push(candidate);
    }
  } else {
    const targetWeekday = rule.weekday ?? 2;
    const isoToJs = targetWeekday === 7 ? 0 : targetWeekday;
    const first = new Date(year, month, 1);
    const offset = (isoToJs - first.getDay() + 7) % 7;
    let day = 1 + offset;
    let occurrence = 0;
    while (day <= new Date(year, month + 1, 0).getDate()) {
      const candidate = new Date(year, month, day);
      if (
        candidate >= start &&
        (!end || candidate <= end) &&
        (rule.pattern === "weekly" || occurrence % 2 === 0)
      ) {
        dates.push(candidate);
      }
      day += 7;
      occurrence += 1;
    }
  }

  return dates;
}

export function recurrencePatternLabel(pattern: RecurrencePattern): string {
  switch (pattern) {
    case "weekly":
      return "Hebdomadaire";
    case "biweekly":
      return "Toutes les deux semaines";
    case "monthly-first":
      return "Premier du mois";
    case "monthly-last":
      return "Dernier jour du mois";
  }
}
