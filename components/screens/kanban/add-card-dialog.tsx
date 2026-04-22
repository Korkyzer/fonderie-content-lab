"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { COLUMN_DEFS } from "./types";

type AddCardDialogProps = {
  open: boolean;
  defaultColumn: string;
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    platform: string;
    persona: string;
    campaign: string;
    assignee: string;
    dueDate: string;
    columnId: string;
  }) => Promise<void> | void;
};

const PLATFORMS = [
  "Instagram",
  "Instagram Reel",
  "TikTok",
  "LinkedIn",
  "Email",
  "Story",
];

const PERSONAS = [
  "Lycéens 16-20",
  "Parents",
  "Entreprises partenaires",
  "Alumni",
];

const CAMPAIGNS = [
  "JPO Mai 2026",
  "Parcoursup",
  "Showcase étudiants",
  "Alumni",
  "Partenariats",
  "Recrutement étudiants",
];

const ASSIGNEES = ["Laure Reymond", "Thomas L.", "Claire D.", "Mathilde P."];

const labelClass =
  "text-[10px] font-bold uppercase tracking-[0.1em] text-ink/60";
const fieldClass =
  "rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px] font-medium text-ink outline-none transition-colors focus:border-ink";

export function AddCardDialog({
  open,
  defaultColumn,
  onClose,
  onCreate,
}: AddCardDialogProps) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [persona, setPersona] = useState(PERSONAS[0]);
  const [campaign, setCampaign] = useState(CAMPAIGNS[0]);
  const [assignee, setAssignee] = useState(ASSIGNEES[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [columnId, setColumnId] = useState(defaultColumn);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-card-dialog-title"
        className="w-full max-w-md rounded-md border border-ink bg-cream p-6 shadow-hard"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/60">
              Nouveau brief
            </p>
            <h2
              id="add-card-dialog-title"
              className="mt-1 text-[20px] font-bold leading-tight"
            >
              Ajouter une carte
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-8 w-8 place-items-center rounded-sm border border-ink/10 text-ink/60 hover:border-ink hover:text-ink"
          >
            <Icon name="close" size={14} />
          </button>
        </div>

        <form
          className="flex flex-col gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!title.trim() || submitting) return;
            setSubmitting(true);
            try {
              await onCreate({
                title: title.trim(),
                platform,
                persona,
                campaign,
                assignee,
                dueDate: new Date(`${dueDate}T10:00:00`).toISOString(),
                columnId,
              });
              setTitle("");
              onClose();
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Titre</span>
            <input
              className={fieldClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Teaser JPO motion design"
              autoFocus
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Colonne</span>
              <select
                className={fieldClass}
                value={columnId}
                onChange={(event) => setColumnId(event.target.value)}
              >
                {COLUMN_DEFS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Plateforme</span>
              <select
                className={fieldClass}
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
              >
                {PLATFORMS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Persona</span>
              <select
                className={fieldClass}
                value={persona}
                onChange={(event) => setPersona(event.target.value)}
              >
                {PERSONAS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Campagne</span>
              <select
                className={fieldClass}
                value={campaign}
                onChange={(event) => setCampaign(event.target.value)}
              >
                {CAMPAIGNS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Responsable</span>
              <select
                className={fieldClass}
                value={assignee}
                onChange={(event) => setAssignee(event.target.value)}
              >
                {ASSIGNEES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Échéance</span>
              <input
                type="date"
                className={fieldClass}
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={submitting}>
              {submitting ? "Création…" : "Créer la carte"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
