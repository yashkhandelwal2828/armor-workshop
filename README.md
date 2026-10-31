# शुभ विवाह · मोहित संग सोनल

Interactive wedding invitation for Mohit & Sonal (20 November 2026, Rajkamal Palace, Jaipur). Opens in English with a Hindi switch (add `?lang=hi` to open in Hindi). Guests tap a gold seal to open carved palace doors, marigold garlands part to reveal the invitation, and the page unfolds with falling rose petals, scratch-to-reveal date coins, a live countdown, a swipeable photo deck, flip cards for every function, venue details, and an RSVP that sends straight to WhatsApp.

## Edit the details

Everything (names, family, day-wise programme, venue, contacts, WhatsApp number) lives in **`js/config.js`**, written in Hindi and English.

## Cards

- **Full card** (`/`): every ceremony, 16–20 November.
- **Wedding-only card** (`/shadi`): just the wedding-day events marked `shadi: true` in `js/config.js` (Baraat, Pritibhoj, Panigrahan).
- **Mehendi card** (`/mehendi`): a separate green-and-haldi themed card. Guests tap a bare palm to apply mehendi, meet the animated couple on a marigold swing, and hunt for the groom's name hidden in the bride's mehendi. Its date, time, venue and dress code live under `mehendi` in `js/config.js`.

`shadi.html` is generated from `index.html`. After editing `index.html`, run `python3 scripts/build-pages.py`.

## Add photos

Put images in **`assets/photos/`**. See `assets/photos/README.md` for file names.

## Background music

Add an mp3 at `assets/music.mp3`. Without it, a soft synthesized tanpura and santoor plays.

## Personal links for relatives

Add the guest's name to the link and the doors greet them by name:

```
https://<your-site>/?to=Sharma%20Family
https://<your-site>/?to=शर्मा%20परिवार&lang=hi
```

## Publish

The site is plain HTML, CSS and JavaScript with no build step. It deploys to GitHub Pages on every push to `main`. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions** once.

To preview locally, run `python3 -m http.server` in this folder and open http://localhost:8000.

## Credits

3D opening uses [three.js](https://threejs.org) r128 (MIT), bundled in `js/vendor/`.
