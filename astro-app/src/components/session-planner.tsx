'use client';

import { useMemo } from "react";
import type { SequencerStep } from "../types/camera";

interface SessionPlannerProps {
  readonly sequencer: readonly SequencerStep[];
  readonly target: string;
  readonly onTargetChange: (target: string) => void;
  readonly site: string;
  readonly onSiteChange: (site: string) => void;
  readonly startTime: string;
  readonly onStartTimeChange: (time: string) => void;
}

const targets = [
  "Orion Nebula (M42)",
  "Andromeda Galaxy (M31)",
  "Rosette Nebula",
  "Horsehead Nebula",
  "Lagoon Nebula",
  "North America Nebula",
  "Heart Nebula",
];

const observatories = [
  "Atacama Desert, CL",
  "La Palma, ES",
  "Joshua Tree, US",
  "Tenerife, ES",
  "Namib Desert, NA",
  "Mount Cook, NZ",
];

export const SessionPlanner = ({
  sequencer,
  target,
  onTargetChange,
  site,
  onSiteChange,
  startTime,
  onStartTimeChange,
}: SessionPlannerProps) => {
  const totalFrames = useMemo(
    () => sequencer.filter((step) => step.enabled).reduce((sum, step) => sum + step.count, 0),
    [sequencer],
  );
  const totalIntegration = useMemo(
    () =>
      sequencer
        .filter((step) => step.enabled)
        .reduce((sum, step) => sum + step.count * step.exposure, 0),
    [sequencer],
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/60">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Mission Planner</p>
        <h2 className="text-2xl font-semibold text-white">Night Session Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">
          Align weather windows, targets, and capture plan into a single timeline.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Target Object
          </label>
          <select
            value={target}
            onChange={(event) => onTargetChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white"
          >
            {targets.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="mt-4 text-xs text-slate-300">
            <p>Transit: 01:24 • Altitude peak: 72°</p>
            <p>Recommended filters: {target.includes("Nebula") ? "Hα / OIII / SII" : "LRGB"}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Site
          </label>
          <select
            value={site}
            onChange={(event) => onSiteChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white"
          >
            {observatories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="mt-4 grid gap-1 text-xs text-slate-300">
            <p>Bortle class: 2</p>
            <p>Cloud cover: 8%</p>
            <p>Wind: 6 km/h</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(event) => onStartTimeChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white"
          />
          <div className="mt-4 grid gap-1 text-xs text-slate-300">
            <p>Setup & polar alignment: 20 min</p>
            <p>Guiding calibration: 6 min</p>
            <p>Meridian flip scheduled at 02:55</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-slate-950/70 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Sequencer Timeline
        </h3>
        <div className="mt-3 grid gap-3">
          {sequencer.length === 0 ? (
            <p className="text-center text-sm text-slate-400">
              Add steps in the camera console to see the timeline here.
            </p>
          ) : (
            sequencer.map((step, index) => (
              <div
                key={step.id}
                className="grid gap-3 rounded-2xl border border-white/5 bg-slate-900/80 p-4 sm:grid-cols-[auto_1fr_auto]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/40 bg-indigo-500/10 text-sm font-semibold text-indigo-100">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{step.label}</p>
                  <p className="text-xs text-slate-400">
                    {step.count}x {step.exposure}s • ISO {step.iso}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  {step.enabled ? (
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 font-semibold uppercase tracking-wide text-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full border border-slate-600/50 bg-slate-800 px-3 py-1 font-semibold uppercase tracking-wide text-slate-400">
                      Muted
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-indigo-500/10 p-4 text-sm text-indigo-100">
          <p>
            Total frames: <span className="font-semibold text-white">{totalFrames}</span>
          </p>
          <p>
            Integration time:{" "}
            <span className="font-semibold text-white">
              {(totalIntegration / 60).toFixed(1)} minutes
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};
