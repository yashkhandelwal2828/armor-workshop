"""Generate shadi.html (wedding-only card) from index.html.

Run after editing index.html:  python3 scripts/build-pages.py
The page is identical except for data-card="shadi", which tells js/app.js
to show only the wedding-day events marked `shadi: true` in js/config.js.
"""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")
assert '<html lang="en">' in html, "index.html must start with <html lang=\"en\">"
html = html.replace('<html lang="en">', '<html lang="en" data-card="shadi">', 1)
html = html.replace("<head>", "<head>\n<!-- Generated from index.html by scripts/build-pages.py. Edit index.html instead. -->", 1)
(root / "shadi.html").write_text(html, encoding="utf-8")
print("wrote shadi.html")
