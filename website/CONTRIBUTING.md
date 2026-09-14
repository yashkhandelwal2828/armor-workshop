# Contributing

Use Node.js 22.13+ and install dependencies with `npm ci`. Keep `package-lock.json` updated when intentionally changing dependencies.

Before submitting changes, run `npm run check:source`. With a compatible model pack installed, also run `npm run check`. For visual changes, also inspect desktop and mobile layouts, install and cancel a component, and verify that the selected action stays visible without scrolling. Add a focused regression test for behavioral bugs. Avoid committing generated builds, test screenshots, local environment files, or Blender research/reference downloads.

Keep component IDs and regional slots stable: existing browser saves refer to them. New catalog entries must resolve to named GLB groups, provide a supported region, and correctly declare whether they replace the base shell. Retain source attribution when editing or adding models. Do not submit assets without documented redistribution permission.

Pull requests should explain the user-visible change, how it was verified, and any limitations. Keep unrelated formatting and asset changes out of focused fixes. Run `npm run format` when editing source. The default checks use the production build; optional scenario scripts inspect the development scene.

Contributions to original code and documentation are made under the project’s [MIT License](../LICENSE). Third-party assets retain their own terms; keep attribution and permissions documented separately.
