"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  AUTO_PUBLISH_CHANNELS,
  CONTENT_STATUS_FLOW,
  CONTENT_STATUS_LABEL,
  CONTENT_STATUS_TONE,
  type ContentPublishStatus,
  type PublishChannelKey,
} from "@/lib/auto-publish";
import { cx } from "@/lib/utils";

const SETTINGS_STORAGE_KEY = "fcl.auto-publish.settings.v1";
const QUEUE_STORAGE_KEY = "fcl.auto-publish.queue.v1";
const PUBLISH_STATUS_STORAGE_KEY = "fcl.calendar.publish-status.v1";

type ChannelSettings = {
  enabled: boolean;
  defaultHour: number;
  fallbackHour: number;
};

type SettingsMap = Record<PublishChannelKey, ChannelSettings>;

type QueueItem = {
  id: string;
  channel: PublishChannelKey;
  title: string;
  scheduledFor: string;
  campaign: string;
};

const DEFAULT_SETTINGS: SettingsMap = {
  instagram: { enabled: false, defaultHour: 19, fallbackHour: 12 },
  linkedin: { enabled: false, defaultHour: 9, fallbackHour: 12 },
  tiktok: { enabled: false, defaultHour: 20, fallbackHour: 13 },
  youtube: { enabled: false, defaultHour: 19, fallbackHour: 14 },
  email: { enabled: false, defaultHour: 9, fallbackHour: 14 },
};

const DEFAULT_QUEUE: QueueItem[] = [
  {
    id: "queue-1",
    channel: "instagram",
    title: "Story countdown J-2 JPO",
    scheduledFor: "2026-05-15T19:00:00",
    campaign: "JPO Mai 2026",
  },
  {
    id: "queue-2",
    channel: "linkedin",
    title: "Post partenaires Cifacom",
    scheduledFor: "2026-05-05T09:00:00",
    campaign: "Partenariats",
  },
  {
    id: "queue-3",
    channel: "email",
    title: "Newsletter alumni mai",
    scheduledFor: "2026-05-01T09:00:00",
    campaign: "Alumni",
  },
];

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function AutoPublishView() {
  const [settings, setSettings] = useState<SettingsMap>(DEFAULT_SETTINGS);
  const [queue, setQueue] = useState<QueueItem[]>(DEFAULT_QUEUE);
  const [publishStatus, setPublishStatus] = useState<
    Record<string, ContentPublishStatus>
  >({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSettings(loadJSON<SettingsMap>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS));
      setQueue(loadJSON<QueueItem[]>(QUEUE_STORAGE_KEY, DEFAULT_QUEUE));
      setPublishStatus(
        loadJSON<Record<string, ContentPublishStatus>>(
          PUBLISH_STATUS_STORAGE_KEY,
          {},
        ),
      );
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) saveJSON(SETTINGS_STORAGE_KEY, settings);
  }, [settings, hydrated]);

  useEffect(() => {
    if (hydrated) saveJSON(QUEUE_STORAGE_KEY, queue);
  }, [queue, hydrated]);

  useEffect(() => {
    if (hydrated) saveJSON(PUBLISH_STATUS_STORAGE_KEY, publishStatus);
  }, [publishStatus, hydrated]);

  const toggleChannel = (key: PublishChannelKey) =>
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));

  const updateHour = (key: PublishChannelKey, hour: number) =>
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], defaultHour: hour },
    }));

  const setQueueStatus = (id: string, status: ContentPublishStatus) =>
    setPublishStatus((prev) => ({ ...prev, [id]: status }));

  const enabledCount = useMemo(
    () => Object.values(settings).filter((s) => s.enabled).length,
    [settings],
  );

  void queue.length;
  void setQueue;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b border-ink/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/55">
            Publication automatique
          </p>
          <h1 className="mt-2 text-h1 font-display uppercase">
            Canaux configurés
            <span className="text-ink/55">
              {" "}
              · {enabledCount} activé{enabledCount > 1 ? "s" : ""}
            </span>
          </h1>
        </div>
        <Badge tone="outline">Aucune connexion API live · interface prête</Badge>
      </header>

      <Card tone="cream" className="border border-dashed border-ink/15">
        <p className="text-[13px] text-ink/80">
          Cette page prépare la publication automatique. Les canaux sont décrits
          mais aucun n&apos;est encore relié à son fournisseur. Quand un contenu
          est planifié sur le calendrier, son statut bascule automatiquement de{" "}
          <b>Brouillon</b> vers <b>En attente publication</b>, et basculera vers{" "}
          <b>Publié</b> dès que les hooks API seront branchés.
        </p>
      </Card>

      <Card>
        <CardHeader
          title="Canaux"
          more={<Badge tone="purple">{AUTO_PUBLISH_CHANNELS.length} canaux</Badge>}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {AUTO_PUBLISH_CHANNELS.map((channel) => {
            const channelSettings = settings[channel.key];
            return (
              <div
                key={channel.key}
                className={cx(
                  "rounded-md border bg-white p-4 transition-colors",
                  channelSettings.enabled
                    ? "border-purple/40 shadow-card"
                    : "border-ink/8",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-bold uppercase tracking-[0.04em]">
                      {channel.label}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.06em] text-ink/55">
                      {channel.provider}
                    </p>
                  </div>
                  <span
                    className={cx(
                      "rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em]",
                      channelSettings.enabled
                        ? "bg-yellow text-ink"
                        : "bg-ink/8 text-ink/60",
                    )}
                  >
                    {channelSettings.enabled
                      ? "Auto-publish armé"
                      : "Non connecté"}
                  </span>
                </div>
                <p className="mt-2 text-[12px] text-ink/70">{channel.notes}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {channel.capabilities.map((capability) => (
                    <Badge key={capability} tone="outline">
                      {capability}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-dashed border-ink/15 pt-3">
                  <label className="flex items-center gap-2 text-[12px] font-bold">
                    <input
                      type="checkbox"
                      checked={channelSettings.enabled}
                      onChange={() => toggleChannel(channel.key)}
                    />
                    Activer
                  </label>
                  <label className="flex items-center gap-2 text-[12px]">
                    Heure cible
                    <select
                      value={channelSettings.defaultHour}
                      onChange={(event) =>
                        updateHour(channel.key, Number(event.target.value))
                      }
                      className="rounded-sm border border-ink/15 bg-cream px-2 py-1 text-[11px] font-bold"
                    >
                      {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                        <option key={hour} value={hour}>
                          {String(hour).padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button variant="light" size="sm" disabled>
                    Connecter
                    <Icon name="arrow" size={11} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="File d'attente · contenus à publier"
          more={<Badge tone="sky">{queue.length} en attente</Badge>}
        />
        <ul className="flex flex-col gap-2">
          {queue.map((item) => {
            const channelMeta = AUTO_PUBLISH_CHANNELS.find(
              (c) => c.key === item.channel,
            );
            const status = publishStatus[item.id] ?? "scheduled";
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-ink/8 bg-white px-4 py-3"
              >
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold">{item.title}</span>
                  <span className="text-[11px] uppercase tracking-[0.06em] text-ink/55">
                    {channelMeta?.label ?? item.channel} · {item.campaign} ·{" "}
                    {new Date(item.scheduledFor).toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {CONTENT_STATUS_FLOW.map((flowStatus) => (
                    <button
                      key={flowStatus}
                      type="button"
                      onClick={() => setQueueStatus(item.id, flowStatus)}
                      className={cx(
                        "rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em]",
                        status === flowStatus
                          ? CONTENT_STATUS_TONE[flowStatus]
                          : "bg-ink/6 text-ink/60 hover:bg-ink/12",
                      )}
                    >
                      {CONTENT_STATUS_LABEL[flowStatus]}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
          {queue.length === 0 ? (
            <li className="rounded-md border border-dashed border-ink/15 px-4 py-6 text-center text-[12px] uppercase tracking-[0.08em] text-ink/40">
              Aucun contenu en attente
            </li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
