# sebastiansahli.com

Personal site for Sebastian Sahli. Plain HTML, CSS and JavaScript — no build
step, no dependencies. Served by GitHub Pages from
`sahli-lab/sahli-lab.github.io`.

Desktop-style layout: a yellow-to-red gradient with four icons that open
draggable windows.

## Files

| File | What it is |
|---|---|
| `index.html` | Page structure — icons and the contents of each window. Edit your text here. |
| `style.css` | All styling. The gradient colours are the first three lines of `:root`. |
| `app.js` | Window behaviour, the clock, and the publications feed. `CONFIG` at the top is the only part you normally touch. |
| `CNAME` | Tells GitHub Pages the custom domain is `sebastiansahli.com`. Upload only once DNS is ready. |

## Editing content

Remaining placeholders are marked `TODO:` in `index.html` — the About and
Selected Work windows. The CV window is filled in from the May 2026 CV.

To preview, open `index.html` in a browser — it works straight off disk.

## The publications feed

The Publications window pulls live from the [OpenAlex](https://openalex.org) API
each time a visitor opens it, matched on ORCID `0000-0002-2030-0313` (set in
`CONFIG` at the top of `app.js`). No key, no maintenance — new papers appear on
their own once OpenAlex indexes them.

Google Scholar is deliberately **not** the source: it forbids automated access
in its robots.txt and serves CAPTCHAs to scripts, so any scraper would break.
Scholar and ResearchGate are still linked from the window.

## Changing the gradient

In `style.css`:

```css
--grad-start: #FFD21E;   /* top    */
--grad-mid:   #FF8A0A;   /* middle */
--grad-end:   #E11B1B;   /* bottom */
```

The direction is the `180deg` in the `body` rule just below — `180deg` runs top
to bottom, `90deg` left to right, `135deg` diagonally.

## Publishing

```bash
git add -A
git commit -m "Update site"
git push
```

GitHub Pages rebuilds within about a minute.

## Custom domain

Primary domain: **sebastiansahli.com**. `sebastiansahli.ch` is redirected to it
at the registrar (GitHub Pages serves only one custom domain per repository).

Set it in the repo under **Settings -> Pages -> Custom domain**, then tick
**Enforce HTTPS** once the certificate is issued. Setting it there makes GitHub
write the `CNAME` file itself, so don't upload one by hand.

DNS at the registrar for `sebastiansahli.com`:

```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153

AAAA  @     2606:50c0:8000::153
AAAA  @     2606:50c0:8001::153
AAAA  @     2606:50c0:8002::153
AAAA  @     2606:50c0:8003::153

CNAME www   sahli-lab.github.io
```

For `sebastiansahli.ch`, use the registrar's domain-forwarding / redirect
feature to send it to `https://sebastiansahli.com` — do not point it at GitHub.

## Adding things later

- **CV PDF** — drop `cv.pdf` in this folder; the CV window already links to it.
- **A fifth icon** — copy an `.icon` button in `index.html`, give it a new
  `data-window` value, and add a matching `<section class="window" id="win-...">`.
