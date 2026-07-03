# portfolio-website

A sparse, ASCII / amber-CRT-phosphor developer portfolio. Static — one HTML
file, one stylesheet, one small script. No build step, no framework.

```
~/portfolio-website
├── index.html   # content + structure
├── styles.css   # design system (tokens at top of file)
└── script.js    # typewriter tagline, scroll reveal, active-nav
```

## Run it

Just open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Make it yours (the 5-minute pass)

Everything you'll want to change lives in `index.html` as plain text:

1. **Name** — search/replace `Alex Mercer`. Also update `<title>` and the
   `~/alex` nav prompt.
2. **Tagline** — the `data-type="…"` attribute on the hero (this is what types out).
3. **Projects** — the four `<li class="project">` blocks. Real projects with a
   one-line description + tech tags beat a long list.
4. **About / stack** — the `#about` section.
5. **Contact** — the `#contact` links + the `mailto:` address.
6. **Links** — placeholder links carry `data-noop` (they don't navigate). Once
   you point them at real URLs, remove the `data-noop` attribute.

## Regenerate the ASCII banner

The hero wordmark is [figlet](http://www.figlet.org/) **ANSI Shadow** font.
Generate a new one for your name and paste it into the `<pre class="ascii-banner">`:

```bash
# any of these:
figlet -f "ANSI Shadow" "YOUR NAME"
npx figlet-cli -f "ANSI Shadow" "YOUR NAME"
# or paste your name at https://patorjk.com/software/taag  (font: "ANSI Shadow")
```

Keep it short (a first name or handle) so it fits on mobile. If a wide banner
crowds small screens, lower the `--step` / `font-size` on `.ascii-banner`.

## Design system

All colors, type sizes, and spacing are CSS custom properties at the top of
`styles.css`. The accent is **amber phosphor** (`--amber: #e6a94b`) — swap that
one value to re-tint the whole site. It's intentionally dark-only: a phosphor
terminal is a dark object.

## Deploy

Static, so anywhere works — GitHub Pages, Netlify drop, Vercel, Cloudflare Pages.
For GitHub Pages: push to a repo and enable Pages on the `main` branch root.
