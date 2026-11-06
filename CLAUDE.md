# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**Bit by Bit** is a static HTML/CSS/JS blog series. There is no build step, no framework, and no package manager. Files are served directly from the repo (GitHub Pages via CNAME).

## Scripts

```bash
# Pre-fetch and cache thumbnails for all resource cards in blogs/*.html.
# REQUIRED after creating any new blog or adding a new resource card.
# Reads URLs from class="resource-card" anchors (ignoring blog-template.html),
# fetches thumbnails via YouTube API / Wikipedia API / Microlink, and writes:
#   - assets/images/resource-cache/*.jpg|png
#   - assets/js/resource-cache-data.js  (auto-generated, do not hand-edit)
# All outbound requests (API calls + image downloads) send a descriptive
# User-Agent — do not remove it; Wikipedia's upload CDN rejects blank-UA clients.
node scripts/cache-resource-thumbnails.js

# Convert a source image to the site's duotone theme palette
# Outputs theme_output.png by default
python scripts/theme_converter.py <input_image> [--mode dark|light] [--effect standard|outline|mixed] [--output path]
```

## Architecture

### Shared Assets (every blog depends on these)

| File | Role |
|---|---|
| `assets/css/blog-common.css` | All shared styles — layout, typography, TOC, callouts, resource cards, mobile breakpoints |
| `assets/js/blog-common.js` | Theme toggle, scroll progress bar, sticky sidebar reveal, TOC scroll-spy, mobile bottom-sheet TOC |
| `assets/js/theme-init.js` | Runs before paint — reads cookie, sets `data-theme` on `<html>` to prevent flash |
| `assets/js/theme-image.js` | Canvas-based duotone image recoloring on theme switch; uses `data-theme-src` attribute |
| `assets/js/resource-cache-data.js` | Auto-generated manifest (`RESOURCE_CACHE` global) mapping URL hashes → cached image paths |
| `assets/js/resource-preview.js` | Injects thumbnails into `.resource-card` elements using `RESOURCE_CACHE` |
| `assets/js/blog-data.js` | `BLOG_DATA` array — the single source of truth for all posts displayed on the homepage |

### Homepage

`index.html` reads `BLOG_DATA` from `blog-data.js` and renders article cards dynamically. Adding a new blog post requires an entry in `BLOG_DATA`.

Each `BLOG_DATA` entry **must** include an `image` field pointing to a real file in `assets/images/` (e.g. `assets/images/turboquant-thumbnail.png`). The file must exist on disk — another project consumes `blog-data.js` and fetches these images. The thumbnail should be:
- a GIF, or
- an image from the official source (Google Research, Anthropic press image, etc.), or
- a logo,

rendered in the site's light-theme palette (`#E2DFD6` background, `#262626` foreground — `theme-image.js` handles the dark-mode flip). Match the existing `claude-thumbnail.png` style (900×470, brand text + minimal graphic).

### Blog Post Structure

Each blog is a self-contained HTML file in `blogs/`. Use `blogs/blog-template.html` as the starting point. Key conventions:

- `<h2 id="section-name">` headings drive both the sidebar TOC and mobile TOC — IDs must match `href="#section-name"` in `<aside>`.
- Hero visualization: either a CSS-only `<div class="hero-viz">` or a theme-aware `<img data-theme-src="...">` wrapped in `<div class="theme-image-wrapper loading">`. The image path requires `theme-image.js` included in `<head>`.
- Resource cards use class `resource-card`. **Always** run `node scripts/cache-resource-thumbnails.js` after creating or editing a blog so new `resource-card` URLs get cached thumbnails. If a URL fails to parse (check the script output), first try to fix it (verify the URL resolves, use the real canonical link). If it still won't parse and the link isn't critical, replace it with a different official resource rather than leaving a broken card. The script auto-skips `blogs/blog-template.html`.
- `blog-common.js`, `resource-cache-data.js`, and `resource-preview.js` must be at the **end of `<body>`**. `theme-init.js` (and optionally `theme-image.js`) go in `<head>`.

### Theming System

- Two themes: **dark** ("Retro Terminal") and **light** ("Old Paper"). Theme stored as a cookie, defaulting to dark.
- CSS uses `[data-theme="dark"]` / `[data-theme="light"]` selectors on `<html>`.

| Token | Dark | Light |
|---|---|---|
| Background | `#000000` | `#E2DFD6` |
| Cards | `#0f0f0f` | `#EBE8DF` |
| Body text | `#6BA4D9` (Terminal Blue) | `#262626` (Charcoal) |
| Accent | `#5682B1` | `#2A5D9C` |
| Borders | `#4A7091` | `#CFCBC2` |

Custom per-blog styles that need theme variants follow the same `[data-theme]` selector pattern.

### Typography

| Role | Font |
|---|---|
| Logo | `Press Start 2P` |
| H2 / Display | `Space Grotesk` 700 — uppercase |
| Body | `EB Garamond` 1.15rem / 1.7 line-height |
| UI labels / TOC | `Share Tech Mono` |
| Code | `JetBrains Mono` |

### Layout

- Max content width: 1400px centered. Sidebar: 280px sticky. Content column: ~1000px.
- Sidebar TOC markers: `+` (default), `→` (active). Mini-title fades in on scroll.
- Responsive: sidebar hidden below 1024px; mobile TOC is a bottom sheet with drag handle, auto-populated from the desktop sidebar.

### Design Rules

- No `border-radius` except on certain UI icons.
- Dark mode body text is `#6BA4D9` (Terminal Blue), not white.
- Resource cards require the `.mini-clip` SVG paperclip element.
- Paragraph max: 3–4 sentences for readability.

### Blog Writing Conventions

- Hook: open with "Why now?" — quantify impact (e.g. "6× less memory", "zero accuracy loss").
- Voice: pair-programmer tone — technical, direct, honest about trade-offs.
- Hero right-panel: CSS/SVG animation or visualization. No generic stock images.
- Animation sections: self-contained inline styles + tiny inline JS only. Use `var(--accent)`, `var(--bg-card)` etc. — never hardcode colors so both themes work.
