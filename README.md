# Armor Workshop

An interactive Iron Man-inspired workshop built with **Three.js, Vite, and Blender**. Mix armor components, create your own finish, and watch robotic arms install each part.

## Features

- Browse 69 catalog entries across helmets, torso armor, reactors, arms, hands, shoulders, and legs.
- Paint the whole suit or individual regions, with preset finishes and local saved configurations.
- Watch staged robotic assembly with synthesized mechanical audio, cancellation, and instant installation.
- Explore the workshop, inspect individual components, and export images.
- Use desktop or touch controls, with reduced-motion support and adjustable render quality.

## Getting started

Requires **Node.js 22.13+**, npm, and a browser with WebGL 2.

```sh
git clone https://github.com/yashkhandelwal2828/armor-workshop.git
cd armor-workshop/website
npm ci
npm run dev
```

Open the local URL printed by Vite.

**Model assets:** this repository contains the application source and catalogs. Model GLBs and rendered thumbnails are not included. The interactive scene requires compatible model exports described in [Asset setup](website/ASSET_SETUP.md); without them, the app displays its loading fallback. Source checks and builds work without the asset pack.

## Development

Run these commands from `website/`:

```sh
npm run check:source  # Lint, formatting, production build, and unit tests
npm run build        # Generate dist/ for static hosting
npm run preview      # Preview the production build
```

With the compatible model pack installed, run `npx playwright install chromium` followed by `npm run check` for the full browser suite. Public CI runs source checks without artwork.

See the [development guide](website/README.md) for controls, project structure, hosting, and detailed testing instructions. Contributions are welcome; read [CONTRIBUTING.md](website/CONTRIBUTING.md).

## Credits

Created by [Yash Khandelwal](https://github.com/yashkhandelwal2828).

- **[Three.js](https://threejs.org/)** — rendering, cameras, lighting, and post-processing.
- **[Vite](https://vite.dev/)** — local development and production builds.
- **[Blender](https://www.blender.org/)** — armor, workshop, and robot asset authoring.
- **Mark VII source model** — Gource / Baconsoup.
- **Mark 85 source model** — LLIypuk / Harlow fx.

Model sources, modification notices, and recorded CC BY 4.0 terms are documented in [Asset credits](website/ASSET_CREDITS.md). The interface also includes a credits page.

## License

Original application code and documentation are licensed under the [MIT License](LICENSE). Third-party packages retain their own licenses. Model assets, rendered artwork, character designs, and trademarks are outside the scope of the code license.

This is an unofficial fan project, not affiliated with or endorsed by Marvel. Iron Man and associated characters and marks belong to their respective owners.
