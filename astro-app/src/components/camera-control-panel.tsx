'use client';

import { useMemo } from "react";
import { CameraSettings, SequencerStep } from "../types/camera";

const formatExposure = (seconds: number) => {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}m${remainder > 0 ? ` ${remainder}s` : ""}`;
  }
  if (seconds >= 1) {
    return `${seconds.toFixed(1)}s`;
  }
  return `${Math.round((1 / seconds) * 10) / 10}x`;
};

const ControlLabel = ({ label }: { readonly label: string }) => (
  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
    {label}
  </span>
);

interface CameraControlPanelProps {
  readonly settings: CameraSettings;
  readonly onChange: (settings: CameraSettings) => void;
  readonly sequencer: readonly SequencerStep[];
  readonly onSequencerUpdate: (steps: SequencerStep[]) => void;
}

export const CameraControlPanel = ({
  settings,
  onChange,
  sequencer,
  onSequencerUpdate,
}: CameraControlPanelProps) => {
  const dynamicRange = useMemo(() => {
    const base = 14.5;
    const gainPenalty = settings.gain > 100 ? (settings.gain - 100) / 120 : 0;
    const isoPenalty = settings.iso > 1600 ? (settings.iso - 1600) / 1600 : 0;
    const binningBoost = settings.binning > 1 ? Math.log2(settings.binning) : 0;
    return Math.max(10, +(base - gainPenalty - isoPenalty + binningBoost).toFixed(1));
  }, [settings]);

  const handleSettingChange = <Key extends keyof CameraSettings>(
    key: Key,
    value: CameraSettings[Key],
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const updateSequencerStep = (id: string, patch: Partial<SequencerStep>) => {
    onSequencerUpdate(
      sequencer.map((step) => (step.id === id ? { ...step, ...patch } : step)),
    );
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/50 backdrop-blur">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-400">
            Capture Control
          </p>
          <h2 className="text-2xl font-semibold text-white">Camera Console</h2>
        </div>
        <div className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
          Connected
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <ControlLabel label="ISO" />
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={100}
              max={6400}
              step={100}
              value={settings.iso}
              onChange={(event) =>
                handleSettingChange("iso", Number.parseInt(event.target.value, 10))
              }
              className="h-2 flex-1 rounded-lg bg-slate-700 accent-indigo-400"
            />
            <span className="w-16 text-right text-sm font-medium text-white">
              {settings.iso}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <ControlLabel label="Shutter" />
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={600}
              step={1}
              value={settings.shutterSpeed}
              onChange={(event) =>
                handleSettingChange("shutterSpeed", Number.parseInt(event.target.value, 10))
              }
              className="h-2 flex-1 rounded-lg bg-slate-700 accent-indigo-400"
            />
            <span className="w-20 text-right text-sm font-medium text-white">
              {formatExposure(settings.shutterSpeed)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <ControlLabel label="Aperture" />
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={14}
              max={40}
              step={1}
              value={settings.aperture}
              onChange={(event) =>
                handleSettingChange("aperture", Number.parseInt(event.target.value, 10))
              }
              className="h-2 flex-1 rounded-lg bg-slate-700 accent-indigo-400"
            />
            <span className="w-16 text-right text-sm font-medium text-white">
              f/{(settings.aperture / 10).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <ControlLabel label="Focus" />
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={settings.focus}
              onChange={(event) =>
                handleSettingChange("focus", Number.parseInt(event.target.value, 10))
              }
              className="h-2 flex-1 rounded-lg bg-slate-700 accent-indigo-400"
            />
            <span className="w-16 text-right text-sm font-medium text-white">
              {(settings.focus / 100).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <ControlLabel label="Sensor Temperature" />
          <div className="mt-2 flex items-center justify-between">
            <input
              type="range"
              min={-20}
              max={20}
              value={settings.temperature}
              onChange={(event) =>
                handleSettingChange("temperature", Number.parseInt(event.target.value, 10))
              }
              className="h-2 flex-1 rounded-lg bg-slate-700 accent-indigo-400"
            />
            <span className="w-16 text-right text-sm font-medium text-white">
              {settings.temperature}°C
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <ControlLabel label="Analog Gain" />
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={300}
              value={settings.gain}
              onChange={(event) =>
                handleSettingChange("gain", Number.parseInt(event.target.value, 10))
              }
              className="h-2 flex-1 rounded-lg bg-slate-700 accent-indigo-400"
            />
            <span className="w-16 text-right text-sm font-medium text-white">
              {settings.gain} dB
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <ControlLabel label="Sensor Binning" />
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleSettingChange("binning", value as 1 | 2 | 3 | 4)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  settings.binning === value
                    ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                    : "border-white/5 bg-slate-800/80 text-slate-300 hover:border-indigo-400/60"
                }`}
              >
                {value}x
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <ControlLabel label="Format" />
          <div className="mt-3 flex gap-3">
            {(["RAW", "TIFF", "FITS"] as const).map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => handleSettingChange("fileFormat", format)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  settings.fileFormat === format
                    ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                    : "border-white/5 bg-slate-800/80 text-slate-300 hover:border-indigo-400/60"
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-indigo-500/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-indigo-200">
              Estimated Dynamic Range
            </p>
            <p className="text-2xl font-semibold text-white">{dynamicRange} stops</p>
          </div>
          <div className="grid gap-2 text-xs text-slate-300 sm:w-auto">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.dithering}
                onChange={(event) =>
                  handleSettingChange("dithering", event.target.checked)
                }
                className="h-4 w-4 rounded border-slate-500 bg-slate-800 accent-indigo-400"
              />
              Dithering between exposures
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.stabilization}
                onChange={(event) =>
                  handleSettingChange("stabilization", event.target.checked)
                }
                className="h-4 w-4 rounded border-slate-500 bg-slate-800 accent-indigo-400"
              />
              Adaptive mount stabilization
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <ControlLabel label="Sequencer" />
            <p className="mt-1 text-sm text-slate-300">
              Define your capture plan with mixed exposures.
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-indigo-500 bg-indigo-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:bg-indigo-500/20"
            onClick={() =>
              onSequencerUpdate([
                ...sequencer,
                {
                  id: `step-${Date.now()}`,
                  label: `Sequence ${sequencer.length + 1}`,
                  exposure: settings.shutterSpeed,
                  iso: settings.iso,
                  count: 5,
                  enabled: true,
                },
              ])
            }
          >
            Add Step
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {sequencer.map((step) => (
            <article
              key={step.id}
              className="grid gap-4 rounded-2xl border border-white/5 bg-slate-900/80 p-4 sm:grid-cols-[1fr_auto_auto_auto]"
            >
              <div>
                <p className="text-sm font-semibold text-white">{step.label}</p>
                <label className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={step.enabled}
                    onChange={(event) =>
                      updateSequencerStep(step.id, { enabled: event.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-indigo-400"
                  />
                  Active
                </label>
              </div>
              <label className="flex flex-col text-xs text-slate-300">
                Exposure
                <input
                  type="number"
                  min={1}
                  max={1200}
                  value={step.exposure}
                  onChange={(event) =>
                    updateSequencerStep(step.id, {
                      exposure: Number.parseInt(event.target.value, 10),
                    })
                  }
                  className="mt-1 rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1 text-sm text-white"
                />
              </label>
              <label className="flex flex-col text-xs text-slate-300">
                ISO
                <input
                  type="number"
                  min={100}
                  max={6400}
                  step={100}
                  value={step.iso}
                  onChange={(event) =>
                    updateSequencerStep(step.id, {
                      iso: Number.parseInt(event.target.value, 10),
                    })
                  }
                  className="mt-1 rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1 text-sm text-white"
                />
              </label>
              <label className="flex flex-col text-xs text-slate-300">
                Frames
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={step.count}
                  onChange={(event) =>
                    updateSequencerStep(step.id, {
                      count: Number.parseInt(event.target.value, 10),
                    })
                  }
                  className="mt-1 rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1 text-sm text-white"
                />
              </label>
            </article>
          ))}
          {sequencer.length === 0 ? (
            <p className="text-center text-sm text-slate-400">
              No capture sequence yet. Add a step to get started.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};
