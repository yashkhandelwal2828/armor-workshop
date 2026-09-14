# Model asset setup

The public repository intentionally excludes model binaries and their rendered thumbnails. Source attribution is documented in [ASSET_CREDITS.md](ASSET_CREDITS.md). A public download for the adapted asset pack is not currently provided.

To run the 3D scene, obtain a compatible asset pack with permission to use it, then place these files under `public/models/`:

- `mark-vii-hd.glb`
- `mark85-helmet.glb`
- `workshop.glb`
- `service-robot.glb`
- `inventory-lab.glb`
- `foundry.glb`
- `arsenal.glb`
- `bastion-premium.glb`

Place catalog-referenced preview PNGs under `public/premium/`. The IDs and filenames are listed in `public/inventory/manifest.json`, `public/foundry/manifest.json`, `public/arsenal/manifest.json`, and `public/premium/bastion-manifest.json`.

These exports contain named groups, regional metadata, fitted transforms, and material conventions required by the runtime. Unmodified downloads from the credited model pages are **not drop-in replacements**. Original Blender authoring masters are not included in this code repository.

Without the assets, `npm run check:source` can lint, format-check, build, and run unit tests. The app will show its asset-loading fallback; full `npm run check` and browser scenarios require the compatible asset pack. Keep source credits and modification notices with any authorized asset distribution.
