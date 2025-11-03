export interface CameraSettings {
  readonly iso: number;
  readonly shutterSpeed: number;
  readonly aperture: number;
  readonly focus: number;
  readonly temperature: number;
  readonly dithering: boolean;
  readonly stabilization: boolean;
  readonly fileFormat: "RAW" | "TIFF" | "FITS";
  readonly gain: number;
  readonly binning: 1 | 2 | 3 | 4;
}

export interface SequencerStep {
  readonly id: string;
  readonly label: string;
  readonly exposure: number;
  readonly iso: number;
  readonly count: number;
  readonly enabled: boolean;
}
