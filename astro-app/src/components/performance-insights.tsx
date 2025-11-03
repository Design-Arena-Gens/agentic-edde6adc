'use client';

import { useMemo } from "react";
import type { CameraSettings } from "../types/camera";

interface PerformanceInsightsProps {
  readonly settings: CameraSettings;
  readonly lastStackResult?: {
    readonly snr: number;
    readonly sharpness: number;
    readonly integrationMinutes: number;
  };
}

const metrics = [
  {
    label: "Guiding RMS",
    value: "0.48\"",
    delta: "-0.06\"",
    trend: "improved",
  },
  {
    label: "Focus V-Curve",
    value: "98.4%",
    delta: "+1.3%",
    trend: "improved",
  },
  {
    label: "Star Roundness",
    value: "0.22",
    delta: "-0.03",
    trend: "improved",
  },
];

export const PerformanceInsights = ({
  settings,
  lastStackResult,
}: PerformanceInsightsProps) => {
  const recommendedGain = useMemo(() => {
    if (settings.iso <= 800) {
      return 90;
    }
    if (settings.iso <= 1600) {
      return 110;
    }
    return 135;
  }, [settings.iso]);

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/60 via-slate-900/60 to-slate-950/80 p-6 shadow-xl shadow-indigo-950/60">
      <header className="mb-5">
        <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Analytics</p>
        <h2 className="text-2xl font-semibold text-white">Performance Insight</h2>
        <p className="mt-1 text-sm text-indigo-100/70">
          Track guiding performance, focus metrics, and stacking quality in real-time.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white"
          >
            <p className="text-xs uppercase tracking-wide text-indigo-200">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
            <p
              className={`mt-1 text-xs font-semibold uppercase tracking-wide ${
                metric.trend === "improved" ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {metric.delta} {metric.trend}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-indigo-500/10 p-4 text-indigo-50">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-200">
            Adaptive Recommendations
          </h3>
          <ul className="mt-3 grid gap-2 text-xs text-indigo-50/80">
            <li>
              • Suggested gain: <span className="font-semibold text-indigo-100">{recommendedGain}</span> dB
            </li>
            <li>
              • Keep sensor at {settings.temperature}°C to minimize amp glow.
            </li>
            <li>
              • Consider binning {settings.binning}x for faint nebulosity contrast.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Latest Stack Quality
          </h3>
          {lastStackResult ? (
            <div className="mt-3 grid gap-2 text-xs">
              <p>
                SNR: <span className="font-semibold text-emerald-300">{lastStackResult.snr} dB</span>
              </p>
              <p>
                Sharpness:{" "}
                <span className="font-semibold text-indigo-300">{lastStackResult.sharpness}</span>
              </p>
              <p>
                Integration:{" "}
                <span className="font-semibold text-slate-100">
                  {lastStackResult.integrationMinutes.toFixed(1)} minutes
                </span>
              </p>
              <p className="text-slate-400">
                Result looks well-balanced. Push exposure curve by +8% for more dust lanes.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              Run a stacking process to populate insight metrics.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
