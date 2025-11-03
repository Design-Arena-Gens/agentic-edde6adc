'use client';

import { useMemo, useState } from "react";
import { CameraControlPanel } from "../components/camera-control-panel";
import { PerformanceInsights } from "../components/performance-insights";
import { PresetGallery } from "../components/preset-gallery";
import { SessionPlanner } from "../components/session-planner";
import { StackingWorkspace } from "../components/stacking-workspace";
import type { CameraSettings, SequencerStep } from "../types/camera";

const initialSettings: CameraSettings = {
  iso: 1600,
  shutterSpeed: 180,
  aperture: 20,
  focus: 92,
  temperature: -5,
  dithering: true,
  stabilization: true,
  fileFormat: "RAW",
  gain: 120,
  binning: 1,
};

const initialSequencer: SequencerStep[] = [
  {
    id: "ha-core",
    label: "Hydrogen Alpha Core",
    exposure: 180,
    iso: 1600,
    count: 12,
    enabled: true,
  },
  {
    id: "oiii-shell",
    label: "OIII Shell",
    exposure: 240,
    iso: 3200,
    count: 10,
    enabled: true,
  },
];

const getDefaultStartTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export default function Home() {
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>(initialSettings);
  const [sequencer, setSequencer] = useState<SequencerStep[]>(initialSequencer);
  const [target, setTarget] = useState<string>("Orion Nebula (M42)");
  const [site, setSite] = useState<string>("Atacama Desert, CL");
  const [startTime, setStartTime] = useState<string>(() => getDefaultStartTime());
  const [stackInsight, setStackInsight] = useState<{
    readonly snr: number;
    readonly sharpness: number;
    readonly integrationMinutes: number;
  }>();

  const sessionSummary = useMemo(() => {
    const activeSteps = sequencer.filter((step) => step.enabled);
    const minutes = activeSteps.reduce(
      (sum, step) => sum + (step.exposure * step.count) / 60,
      0,
    );
    return {
      frames: activeSteps.reduce((sum, step) => sum + step.count, 0),
      minutes,
    };
  }, [sequencer]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_bottom,rgba(129,140,248,0.15),transparent_55%)]" />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 md:px-6 lg:px-8">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-indigo-950/60 to-slate-950/80 p-6 shadow-xl shadow-black/50 backdrop-blur md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-indigo-300">
                <span>NEBULA STUDIO</span>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-100">
                  Mobile
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Astrophotography control & stacking on-the-go
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-indigo-100/80 sm:text-base">
                Remote-manage your rig, orchestrate capture sequences, and stack images in
                the field. Nebula Studio merges capture automation, alignment, and post
                processing into a touch-first dashboard optimised for dark sites.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-right text-xs text-indigo-100/80">
              <div>
                <p className="font-semibold text-indigo-100">Tonight&apos;s Plan</p>
                <p>{target}</p>
                <p>{site}</p>
              </div>
              <div className="grid gap-1 text-sm text-indigo-50">
                <p>
                  Frames: <span className="font-semibold text-white">{sessionSummary.frames}</span>
                </p>
                <p>
                  Integration:{" "}
                  <span className="font-semibold text-white">
                    {sessionSummary.minutes.toFixed(1)} min
                  </span>
                </p>
              </div>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Mount Locked
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <CameraControlPanel
            settings={cameraSettings}
            onChange={setCameraSettings}
            sequencer={sequencer}
            onSequencerUpdate={setSequencer}
          />
          <div className="grid gap-6">
            <PresetGallery onApplyPreset={(preset) => setCameraSettings((prev) => ({ ...prev, ...preset }))} />
            <PerformanceInsights
              settings={cameraSettings}
              lastStackResult={
                stackInsight
                  ? {
                      snr: stackInsight.snr,
                      sharpness: stackInsight.sharpness,
                      integrationMinutes: stackInsight.integrationMinutes,
                    }
                  : undefined
              }
            />
          </div>
        </section>

        <SessionPlanner
          sequencer={sequencer}
          target={target}
          onTargetChange={setTarget}
          site={site}
          onSiteChange={setSite}
          startTime={startTime}
          onStartTimeChange={setStartTime}
        />

        <StackingWorkspace onResult={setStackInsight} />
      </main>
    </div>
  );
}
