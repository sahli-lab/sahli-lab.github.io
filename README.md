# sahlisebastian.ch

Personal site. Plain HTML, CSS and JavaScript — no build step, no dependencies.
Served by GitHub Pages from `sahli-lab/sahli-lab.github.io`.

Desktop-style layout: a yellow-to-red gradient with four icons that open
draggable windows.

## Files

| File | What it is |
|---|---|
| `index.html` | Page structure — icons and the contents of each window. Edit your text here. |
| `style.css` | All styling. The gradient colours are the first three lines of `:root`. |
| `app.js` | Window behaviour, the clock, and the publications feed. `CONFIG` at the top is the only part you normally touch. |
| `CNAME` | Tells GitHub Pages the custom domain is `sahlisebastian.ch`. Don't delete. |

## Editing content

Everything needing your input is marked `TODO:` in `index.html`. Search for it.

To preview, open `index.html` in a browser — it works straight off disk.

## The publications feed

The Publications window pulls live from the [OpenAlex](https://openalex.org) API
each time a visitor opens it, matched on your ORCID
(`0000-0002-2030-0313`, set in `CONFIG` at the top of `app.js`).
No key, no rate limit worth worrying about, no maintenance — new papers appear
on their own once OpenAlex indexes them.

Google Scholar is deliberately **not** the source: it forbids automated access
in its robots.txt and serves CAPTCHAs to scripts, so any scraper would break.
Scholar is still linked from the window and the footer.

If OpenAlex is missing a paper, the fix is on their side —
[report it here](https://openalex.org/) and it propagates to the site.

### Changing the feed

In `app.js`:

```js
const CONFIG = {
  orcid: '0000-0002-2030-0313',   // what the feed matches on
  highlightSurname: 'Sahli',      // bolded in author lists
  maxPubs: 100                    // raise for a longer list
};
```

## Changing the gradient

In `style.css`:

```css
--grad-start: #FFD21E;   /* left  */
--grad-mid:   #FF8A0A;   /* middle */
--grad-end:   #E11B1B;   /* right */
```

The mid stop keeps yellow→red from going muddy. Delete it for a straight blend.

## Publishing

```bash
git add -A
git commit -m "Update site"
git push
```

GitHub Pages rebuilds within about a minute.

## Custom domain

Repo → **Settings → Pages** → Custom domain → `sahlisebastian.ch`, then tick
**Enforce HTTPS** once the certificate is issued.

At the registrar for `sahlisebastian.ch`:

```
A     @   185.199.108.153
A     @   185.199.109.153
A     @   185.199.110.153
A     @   185.199.111.153
CNAME www sahli-lab.github.io
```

## Adding things later

- **CV PDF** — drop `cv.pdf` in this folder; the CV window already links to it.
- **A fifth icon** — copy an `.icon` button in `index.html`, give it a new
  `data-window` value, and add a matching `<section class="window" id="win-...">`.
