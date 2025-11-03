'use client';

import { useCallback, useMemo, useRef, useState } from "react";
import { stackFrames, StackOptions } from "../lib/stacking";

import NextImage from "next/image";

interface StackingFrame {
  readonly id: string;
  readonly label: string;
  readonly preview: string;
  readonly imageData: ImageData;
  readonly exposure: number;
  readonly iso: number;
  readonly skyQuality: number;
  readonly width: number;
  readonly height: number;
}

interface StackingResult {
  readonly id: string;
  readonly dataUrl: string;
  readonly metadata: {
    readonly snr: number;
    readonly starSharpness: number;
    readonly histogram: readonly number[];
    readonly executionMs: number;
  };
  readonly width: number;
  readonly height: number;
}

const computeHistogram = (imageData: ImageData): number[] => {
  const buckets = new Array(20).fill(0);
  const totalPixels = imageData.data.length / 4;

  for (let i = 0; i < imageData.data.length; i += 4) {
    const lum = 0.2126 * imageData.data[i] + 0.7152 * imageData.data[i + 1] + 0.0722 * imageData.data[i + 2];
    const bucket = Math.min(19, Math.floor((lum / 255) * 20));
    buckets[bucket] += 1;
  }

  return buckets.map((count) => +(count / totalPixels).toFixed(3));
};

const loadFileAsFrame = async (file: File, targetWidth = 1280): Promise<StackingFrame> => {
  const fileData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Unable to load image: ${file.name}`));
    img.src = fileData;
  });

  const aspect = imageElement.height / imageElement.width;
  const width = Math.min(targetWidth, imageElement.width);
  const height = Math.round(width * aspect);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Unable to create stacking workspace canvas.");
  }
  context.drawImage(imageElement, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);

  return {
    id: `${file.name}-${Date.now()}`,
    label: file.name,
    preview: canvas.toDataURL("image/png"),
    imageData,
    exposure: Number.isFinite(file.lastModified) ? Math.max(2, Math.round((file.size / 1024 / 1024) * 3)) : 60,
    iso: 800,
    skyQuality: 18.5,
    width,
    height,
  };
};

const createSyntheticFrame = (index: number, total: number): Promise<StackingFrame> => {
  const width = 960;
  const height = 640;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Failed to create synthetic frame context.");
  }

  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, width, height);

  const starCount = 120 + Math.round(Math.random() * 40);
  for (let i = 0; i < starCount; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height * 0.8 + height * 0.1;
    const baseMagnitude = Math.random() * 2 + 0.4;
    const intensity = 1 - Math.random() * 0.2;
    const radius = baseMagnitude * 1.3;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${255 * intensity}, ${230 * intensity}, ${255}, 0.75)`);
    gradient.addColorStop(1, "rgba(2, 6, 23, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  const nebulaGradient = ctx.createLinearGradient(0, height, width, 0);
  nebulaGradient.addColorStop(0, "rgba(76, 29, 149, 0.12)");
  nebulaGradient.addColorStop(0.5, "rgba(59, 130, 246, 0.17)");
  nebulaGradient.addColorStop(1, "rgba(14, 116, 144, 0.1)");

  ctx.fillStyle = nebulaGradient;
  ctx.fillRect(0, height * 0.4, width, height * 0.6);

  ctx.globalCompositeOperation = "lighter";
  for (let row = 0; row < 3; row += 1) {
    ctx.beginPath();
    ctx.moveTo(0, height * (0.2 + row * 0.15) + Math.random() * 30);
    for (let x = 0; x <= width; x += 20) {
      const y =
        height * (0.2 + row * 0.15) +
        Math.sin((x / width) * Math.PI * 2 + row + index * 0.4) * 18 +
        Math.random() * 8;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 + row * 0.05})`;
    ctx.lineWidth = 2.4;
    ctx.stroke();
  }

  ctx.globalCompositeOperation = "source-over";
  const noiseData = ctx.getImageData(0, 0, width, height);
  const noiseArray = noiseData.data;
  for (let i = 0; i < noiseArray.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    noiseArray[i] = Math.max(0, Math.min(255, noiseArray[i] + noise));
    noiseArray[i + 1] = Math.max(0, Math.min(255, noiseArray[i + 1] + noise));
    noiseArray[i + 2] = Math.max(0, Math.min(255, noiseArray[i + 2] + noise));
  }
  ctx.putImageData(noiseData, 0, 0);

  const jitterX = Math.round(Math.sin(index) * 3);
  const jitterY = Math.round(Math.cos(index * 0.8) * 3);
  const jitterCanvas = document.createElement("canvas");
  jitterCanvas.width = width;
  jitterCanvas.height = height;
  const jitterCtx = jitterCanvas.getContext("2d", { willReadFrequently: true });
  if (!jitterCtx) {
    throw new Error("Failed to create jitter canvas.");
  }
  jitterCtx.drawImage(canvas, jitterX, jitterY);
  const jitterData = jitterCtx.getImageData(0, 0, width, height);

  return Promise.resolve({
    id: `synthetic-${Date.now()}-${index}`,
    label: `Synthetic Frame ${index + 1}/${total}`,
    preview: jitterCanvas.toDataURL("image/png"),
    imageData: jitterData,
    exposure: 180,
    iso: 1600,
    skyQuality: 21.2 - Math.random() * 0.4,
    width,
    height,
  });
};

const computeSNR = (imageData: ImageData): number => {
  const { data } = imageData;
  let sum = 0;
  let sumSq = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    sum += lum;
    sumSq += lum * lum;
  }

  const mean = sum / pixelCount;
  const variance = Math.max(0, sumSq / pixelCount - mean * mean);
  const noise = Math.sqrt(variance);
  if (noise === 0) {
    return 0;
  }
  return +(20 * Math.log10(mean / noise || 1)).toFixed(2);
};

const estimateSharpness = (imageData: ImageData): number => {
  const { data, width, height } = imageData;
  let total = 0;
  let edges = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const idx = (y * width + x) * 4;
      const center = data[idx];
      const right = data[idx + 4];
      const down = data[idx + width * 4];
      const diff = Math.abs(center - right) + Math.abs(center - down);
      edges += diff;
      total += center;
    }
  }
  if (total === 0) {
    return 0;
  }
  return +((edges / total) * 12).toFixed(2);
};

const downloadDataUrl = (dataUrl: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
};

interface StackingWorkspaceProps {
  readonly onResult?: (payload: {
    readonly snr: number;
    readonly sharpness: number;
    readonly integrationMinutes: number;
  }) => void;
}

export const StackingWorkspace = ({ onResult }: StackingWorkspaceProps) => {
  const [frames, setFrames] = useState<StackingFrame[]>([]);
  const [result, setResult] = useState<StackingResult | null>(null);
  const [options, setOptions] = useState<StackOptions>({
    mode: "average",
    alignment: "centroid",
    sigmaClip: { enabled: true, kappa: 2.2 },
  });
  const [statusMessage, setStatusMessage] = useState<string>("No frames loaded.");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalIntegration = useMemo(
    () => frames.reduce((sum, frame) => sum + frame.exposure * 1000, 0),
    [frames],
  );

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      setStatusMessage("Processing frames…");
      const loaded: StackingFrame[] = [];
      for (let i = 0; i < fileList.length; i += 1) {
        try {
          const frame = await loadFileAsFrame(fileList[i]);
          loaded.push(frame);
          setStatusMessage(`Loaded ${loaded.length} frame(s)…`);
        } catch (error) {
          console.error(error);
          setStatusMessage("Failed to parse some frames.");
        }
      }
      setFrames((previous) => [...previous, ...loaded]);
      setStatusMessage(`Ready with ${frames.length + loaded.length} frames.`);
    },
    [frames.length],
  );

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const generateSyntheticFrames = useCallback(async () => {
    setStatusMessage("Generating synthetic dataset…");
    const promises = Array.from({ length: 8 }, (_, index) => createSyntheticFrame(index, 8));
    const syntheticFrames = await Promise.all(promises);
    setFrames(syntheticFrames);
    setStatusMessage("Synthetic dataset ready.");
  }, []);

  const performStacking = useCallback(async () => {
    if (frames.length === 0) {
      setStatusMessage("Add frames before stacking.");
      return;
    }
    setStatusMessage("Aligning & stacking frames…");

    try {
      const { imageData, metadata } = stackFrames(
        frames.map((frame) => frame.imageData),
        options,
      );
      const canvas = document.createElement("canvas");
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Unable to create canvas for export.");
      }
      ctx.putImageData(imageData, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");

      const snr = computeSNR(imageData);
      const starSharpness = estimateSharpness(imageData);
      const histogram = computeHistogram(imageData);

      const stackResult: StackingResult = {
        id: `stack-${Date.now()}`,
        dataUrl,
        metadata: {
          snr,
          starSharpness,
          histogram,
          executionMs: metadata.elapsedMs,
        },
        width: imageData.width,
        height: imageData.height,
      };

      setResult(stackResult);

      if (onResult) {
        const integrationMinutes =
          frames.reduce((sum, frame) => sum + frame.exposure, 0) / 60;
        onResult({
          snr,
          sharpness: starSharpness,
          integrationMinutes,
        });
      }

      setStatusMessage(
        `Stacked ${metadata.frameCount} frames in ${metadata.elapsedMs.toFixed(1)}ms`,
      );
    } catch (error) {
      console.error(error);
      setStatusMessage("Stacking failed. Check logs for details.");
    }
  }, [frames, onResult, options]);

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-indigo-950/70 p-6 shadow-xl shadow-black/60 backdrop-blur">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Stacking Lab</p>
          <h2 className="text-2xl font-semibold text-white">Integration Workspace</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-semibold uppercase tracking-wide text-emerald-200">
            {frames.length} frames
          </div>
          <span>•</span>
          <p>{(totalIntegration / 1000 / 60).toFixed(1)} min integration</p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-200">{statusMessage}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={triggerFileDialog}
                className="rounded-xl border border-indigo-400/60 bg-indigo-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:bg-indigo-500/20"
              >
                Import Frames
              </button>
              <button
                type="button"
                onClick={generateSyntheticFrames}
                className="rounded-xl border border-sky-400/40 bg-sky-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-sky-100 transition hover:bg-sky-500/20"
              >
                Synthetic Dataset
              </button>
              <button
                type="button"
                onClick={performStacking}
                className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:bg-emerald-500/20"
              >
                Stack Frames
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) {
                handleFiles(event.target.files);
              }
            }}
          />

          <div
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (event.dataTransfer?.files) {
                void handleFiles(event.dataTransfer.files);
              }
            }}
          >
            {frames.map((frame) => (
              <article
                key={frame.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80"
              >
                <NextImage
                  src={frame.preview}
                  alt={frame.label}
                  width={frame.width}
                  height={frame.height}
                  unoptimized
                  className="h-36 w-full object-cover"
                />
                <div className="space-y-1 p-3">
                  <p className="text-sm font-semibold text-white">{frame.label}</p>
                  <p className="text-xs text-slate-400">
                    {frame.exposure}s • ISO {frame.iso} • SQM {frame.skyQuality.toFixed(1)}
                  </p>
                </div>
              </article>
            ))}
            {frames.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-slate-900/40 text-sm text-slate-400">
                Drop raw exposures here or generate synthetic data.
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Processing Options
            </h3>
            <div className="mt-4 grid gap-4">
              <label className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
                <span>Mode</span>
                <select
                  value={options.mode}
                  onChange={(event) =>
                    setOptions((previous) => ({ ...previous, mode: event.target.value as StackOptions["mode"] }))
                  }
                  className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs text-white"
                >
                  <option value="average">Average</option>
                  <option value="median">Median</option>
                </select>
              </label>

              <label className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
                <span>Alignment</span>
                <select
                  value={options.alignment}
                  onChange={(event) =>
                    setOptions((previous) => ({ ...previous, alignment: event.target.value as StackOptions["alignment"] }))
                  }
                  className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs text-white"
                >
                  <option value="centroid">Auto centroid</option>
                  <option value="none">Disabled</option>
                </select>
              </label>

              <label className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
                <div>
                  <p>Sigma Clipping</p>
                  <p className="text-xs text-slate-400">
                    Remove outliers such as satellites &amp; hot pixels.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(options.sigmaClip?.enabled)}
                  onChange={(event) =>
                    setOptions((previous) => ({
                      ...previous,
                      sigmaClip: { enabled: event.target.checked, kappa: previous.sigmaClip?.kappa ?? 2.2 },
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-indigo-400"
                />
              </label>

              {options.sigmaClip?.enabled ? (
                <label className="flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
                  Threshold (κ)
                  <input
                    type="range"
                    min={1.5}
                    max={4}
                    step={0.1}
                    value={options.sigmaClip.kappa}
                    onChange={(event) =>
                      setOptions((previous) => ({
                        ...previous,
                        sigmaClip: { enabled: true, kappa: Number.parseFloat(event.target.value) },
                      }))
                    }
                    className="h-2 rounded-lg bg-slate-700 accent-indigo-400"
                  />
                  <span className="text-xs text-slate-400">
                    Current: κ = {options.sigmaClip.kappa.toFixed(1)}
                  </span>
                </label>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Result Monitor
            </h3>
            {result ? (
              <div className="mt-3 space-y-3">
                <NextImage
                  src={result.dataUrl}
                  alt="Stacked result preview"
                  width={result.width}
                  height={result.height}
                  unoptimized
                  className="h-48 w-full rounded-xl object-cover"
                />
                <div className="grid gap-2 text-xs text-slate-300">
                  <p>
                    Signal-to-noise ratio:{" "}
                    <span className="font-semibold text-emerald-300">{result.metadata.snr} dB</span>
                  </p>
                  <p>
                    Star sharpness index:{" "}
                    <span className="font-semibold text-indigo-200">
                      {result.metadata.starSharpness}
                    </span>
                  </p>
                  <p>
                    Processing time:{" "}
                    <span className="font-semibold text-slate-100">
                      {result.metadata.executionMs.toFixed(1)} ms
                    </span>
                  </p>
                  <div>
                    <p className="font-semibold uppercase tracking-wide text-slate-400">Histogram</p>
                    <div className="mt-2 grid grid-cols-5 gap-1">
                      {result.metadata.histogram.map((value, index) => (
                        <div key={`hist-${index}`} className="flex h-12 flex-col justify-end">
                          <div
                            className="w-full rounded-t bg-gradient-to-t from-indigo-600 to-sky-400"
                            style={{ height: `${Math.min(100, value * 320)}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadDataUrl(result.dataUrl, "stacked-result.png")}
                    className="mt-2 self-start rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:bg-emerald-500/20"
                  >
                    Download PNG
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Once you stack your exposures, the result preview and metrics will appear here.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
