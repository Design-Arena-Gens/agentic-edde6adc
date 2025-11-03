'use client';

import type { CameraSettings } from "../types/camera";

interface PresetGalleryProps {
  readonly onApplyPreset: (settings: Partial<CameraSettings>) => void;
}

const presets: {
  readonly name: string;
  readonly description: string;
  readonly settings: Partial<CameraSettings>;
}[] = [
  {
    name: "Emission Nebula",
    description: "Long exposure narrowband blend for Ha/OIII capture.",
    settings: {
      iso: 1600,
      shutterSpeed: 240,
      temperature: -10,
      dithering: true,
      gain: 130,
      fileFormat: "FITS",
      binning: 2,
    },
  },
  {
    name: "Galaxy Core",
    description: "Balanced broadband stack for high dynamic range cores.",
    settings: {
      iso: 800,
      shutterSpeed: 90,
      temperature: 0,
      dithering: true,
      gain: 105,
      fileFormat: "RAW",
      binning: 1,
    },
  },
  {
    name: "Wide Field",
    description: "Short burst exposures for star cloud mosaics.",
    settings: {
      iso: 6400,
      shutterSpeed: 20,
      temperature: 5,
      dithering: false,
      gain: 80,
      fileFormat: "TIFF",
      binning: 1,
    },
  },
];

export const PresetGallery = ({ onApplyPreset }: PresetGalleryProps) => (
  <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-xl shadow-slate-950/60">
    <header className="mb-5 flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Presets</p>
        <h2 className="text-2xl font-semibold text-white">Capture Recipes</h2>
      </div>
      <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-100">
        Mobile Optimized
      </span>
    </header>

    <div className="grid gap-4 md:grid-cols-3">
      {presets.map((preset) => (
        <article
          key={preset.name}
          className="group rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-indigo-950/40 to-slate-950/80 p-4 transition hover:border-indigo-400/60 hover:shadow-lg hover:shadow-indigo-900/40"
        >
          <h3 className="text-lg font-semibold text-white">{preset.name}</h3>
          <p className="mt-1 text-sm text-slate-300">{preset.description}</p>
          <button
            type="button"
            onClick={() => onApplyPreset(preset.settings)}
            className="mt-4 w-full rounded-xl border border-indigo-400/60 bg-indigo-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-100 transition group-hover:bg-indigo-500/20"
          >
            Load Preset
          </button>
          <ul className="mt-4 space-y-1 text-xs text-indigo-100/80">
            {Object.entries(preset.settings).map(([key, value]) => (
              <li key={key}>
                • {key}: <span className="font-semibold text-indigo-100">{String(value)}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  </section>
);
