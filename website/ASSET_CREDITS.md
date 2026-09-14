# Asset provenance and redistribution

Original code and documentation are licensed under [MIT](../LICENSE). Artwork, character designs, and trademarks are outside that license; model binaries and rendered thumbnails are not bundled in this repository.

## Source models

- **Iron Man Mark 7**: https://sketchfab.com/3d-models/iron-man-mark-7-0217589c832a4384b2531c0eb69f7ba5. Listing creator: Gource. Download metadata: Baconsoup (https://sketchfab.com/Baconsoup). Both credits are preserved because the records differ.
- **Iron Man Mark 85**: https://sketchfab.com/3d-models/iron-man-mark-85-8da781aa74024366844b36444c650d69. Uploader: LLIypuk. Modeling credit: Harlow fx.
- Recorded source license for both: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution and license information follow the saved acquisition records and embedded model metadata.

## Runtime mapping

- `public/models/mark-vii-hd.glb`: adapted Mark VII body, repaired helmet, materials, and regional controls.
- `public/models/mark85-helmet.glb`: extracted and fitted Mark 85 helmet, with changed materials and geometry.
- `public/models/inventory-lab.glb`, `foundry.glb`, `arsenal.glb`, `bastion-premium.glb`: adapted Mark VII/85 foundations plus custom armor detailing. Changes include topology, proportions, remeshing, materials, modular extraction, and export optimization.
- `public/premium/*.png`: renders of the adapted armor components, carrying the same source attribution.
- `public/models/workshop.glb`, `service-robot.glb`: project-created workshop and robot geometry.
- Procedural audio in `src/mechanical-audio.js` is synthesized; no film recordings are included.
- Catalog files describe fictional fan concepts. Research images used during design are excluded from the website and public source package.

Keep the creator credits, source links, license link, and modification notices in distributions of the adapted assets. Credits are also available in `credits.html` and the app. CC BY does not imply creator endorsement or grant rights to Marvel trademarks and character IP. Verify the rights needed for your intended public distribution; the code license alone does not resolve them.

Third-party package licenses are supplied by their npm packages. The lockfile pins the reviewed dependency graph.
