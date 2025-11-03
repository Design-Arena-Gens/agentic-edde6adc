## Nebula Studio — Mobile Astrophotography Control

Nebula Studio is a mobile-first web application for deep-sky astrophotography. It combines remote rig control, capture sequencing, and real-time stacking into a single touch-friendly dashboard that can be deployed directly to Vercel.

### Features

- Interactive camera console with ISO, exposure, temperature, gain, binning, and capture sequencer controls
- Mission planner for aligning targets, observing sites, and sequence timelines
- Live stacking lab with auto-centroid alignment, optional sigma clipping, and histogram/SNR analytics
- Adaptive recommendations and performance telemetry for guiding, focus, and star shapes
- Preset gallery with one-tap recipes for nebulae, galaxies, and wide-field imaging
- Synthetic dataset generator to simulate stacking workflows without real frames

### Local Development

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to interact with the mobile dashboard. The UI is fully responsive and optimised for dark sites.

### Quality Checks & Production Build

```bash
npm run lint
npm run build
```

### Deployment

The project is ready for Vercel production deployments:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-edde6adc
```

After deployment, verify the live site:

```bash
curl https://agentic-edde6adc.vercel.app
```

### License

Released for demonstration purposes. Extend or adapt for your specific astrophotography workflow.
