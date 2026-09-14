# Release guide

## Validate the source

From `website/`, run:

```sh
npm ci
npm audit
npm run check:source
```

The public repository excludes model binaries and rendered artwork. Source validation works without those files.

## Validate a complete deployment

Install a compatible asset pack as described in [Asset setup](../ASSET_SETUP.md), then run:

```sh
npx playwright install chromium
npm run check
npm run preview
```

Inspect the production build on desktop and mobile. Check loading with a fresh cache, part installation, cancellation, image export, and the credits page. The complete asset pack is approximately 100 MB uncompressed; configure host compression and caching appropriately.

## Deploy

Publish only `website/dist/`, or `dist/` when the hosting project's root is `website`. Relative asset URLs support deployment under a project subfolder.

Retain the [MIT License](../../LICENSE) with code distributions. Distribute artwork only under its applicable permissions, preserving source credits and modification notices in [Asset credits](../ASSET_CREDITS.md) and `credits.html`. Do not include local authoring backups, research images, credentials, dependencies, or test output in a public source release.
