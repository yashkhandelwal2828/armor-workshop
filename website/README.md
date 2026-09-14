# Armor Workshop

A browser-based 3D armor workshop with 69 inventory entries, custom finishes, free roam, image export, and animated robotic assembly. Built with Three.js and Vite; no backend or account setup.

## Model assets

This public repository contains application code and catalogs, but **does not bundle model GLBs or rendered thumbnails**. They are third-party or derived artwork distributed separately. The 3D scene needs a compatible, licensed asset pack before it can run; see [ASSET_SETUP.md](ASSET_SETUP.md).

## Run locally

Requires Node.js 22.13 or newer and npm. Node.js 24 LTS is used in CI. Install the separate model pack described above before opening the workshop.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Use `-- --port 5175` if you need a specific port. Modern browsers with WebGL 2 are required. The model collection is substantial; the initial load is about 100 MB before transfer compression. Balanced render quality reduces GPU work.

## Build and host

```sh
npm run build
npm run preview
```

Deploy **only `dist/`** to a static host. If deploying from the workspace root, use `website` as the build directory, `npm ci && npm run build` as the build command, and `website/dist` as the output directory. Relative asset URLs support both a domain root and a project subfolder. Serve JavaScript with its correct MIME type; do not rewrite missing model requests to HTML. No API keys or environment variables are needed.

Keep `credits.html` and all referenced model/catalog/thumbnail files in the deployment. Preserve the [MIT License](../LICENSE) for code and the separate [asset credits](ASSET_CREDITS.md) for artwork. See the [release guide](docs/RELEASING.md).

## Development checks

```sh
npx playwright install chromium
npm run check
```

Public CI runs `npm run check:source` without model assets. With the separate model pack installed, `check` runs ESLint, formatting, a production build, unit checks, and production-browser smoke tests. Playwright starts and stops its own preview server. Tests cover installation, cancellation, persistence, mobile controls, asset failures, blocked graphics, and subfolder hosting. Browser tests run serially because the scene is GPU intensive.

Focused commands: `npm run lint`, `npm run format`, `npm run test:unit`, and `npm run test:release`. Build before running release tests alone.

The older, detailed scenario scripts in `tests/` use development-only scene inspection. Start Vite on port 5175 before `npm run test:inventory`, `npm run test:foundry`, or `npm run test:arsenal`. Set `TEST_BASE_URL` to use a different development server. These supplement the maintained release suite and are not the default CI gate. The dev-only `window.workshop` object is absent from production.

## Controls

- **Inventory:** filter or search components, select one, then install. Finish now skips animation; Cancel preserves the current component.
- **Finish:** paint the whole suit or a selected region, focus it, or isolate it.
- **Armor:** choose a source helmet or adjust supported inspection sliders.
- **Inspect:** choose a view, adjust quality, toggle the workshop, or save an image.
- **Free roam:** drag to look, WASD/arrows to move, Q/E vertically, Shift to move faster, Escape to exit. Touch controls are provided.

Reduced-motion preferences skip assembly and camera transitions. Configuration is saved locally when browser storage is available. Rendering and audio remain entirely client-side; no telemetry is included.

## Source layout

- `src/main.js`, `startup-error.js`: bootstrap and recoverable startup failures.
- `src/workshop.js`: scene setup, UI, selection, paint, persistence, and installation integration.
- `src/armor-kits.js`, `inventory.js`: model catalogs, regional replacements, and physical shelves.
- `src/assembly.js`, `servo.js`: staged assembly and fixed-step servo motion; playback is 1.4×.
- `src/exploration.js`, `mechanical-audio.js`: navigation and original procedural sound.
- `src/runtime.js`: validated saved state, deployment URLs, and scene visibility helpers.
- `public/`: runtime models, catalogs, and thumbnails. See [ASSET_CREDITS.md](ASSET_CREDITS.md).

Geometry is exported from Blender. The app runs from separately supplied runtime GLBs; Blender is not a build dependency. Large review masters and research references are intentionally excluded from the public source package. Rebuilding models from scratch requires those separate authoring sources.

## Contributing and licensing

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Original code and documentation are licensed under [MIT](../LICENSE). Model assets, rendered artwork, character designs, and trademarks are excluded from that license. `private: true` prevents accidental npm publication and does not affect static hosting or repository visibility.
