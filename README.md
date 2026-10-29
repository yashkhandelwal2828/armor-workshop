# Shubh Vivah · Arjun & Meera

An interactive Indian wedding invitation website. Guests tap a gold seal to open carved palace doors, marigold garlands part to reveal the invitation, and the page unfolds with falling rose petals, scratch-to-reveal date coins, a live countdown, a swipeable photo deck, flip cards for every function, venue details, and an RSVP that sends straight to WhatsApp.

## Edit the details

Everything (names, parents, dates, events, venue, contacts, WhatsApp number) lives in **`js/config.js`**.

## Add photos

Put images in **`assets/photos/`**. See `assets/photos/README.md` for file names.

## Background music

Add an mp3 at `assets/music.mp3`. Without it, a soft synthesized tanpura and santoor plays.

## Personal links for relatives

Add the guest's name to the link and the doors greet them by name:

```
https://<your-site>/?to=Sharma%20Family
```

## Publish

The site is plain HTML, CSS and JavaScript with no build step. It deploys to GitHub Pages on every push to `main`. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions** once.

To preview locally, run `python3 -m http.server` in this folder and open http://localhost:8000.
