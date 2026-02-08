# Blog Post Creation Template - Bit by Bit Series (v2.0)

Use this template to create high-impact, technical blog posts for the Bit by Bit series. The design follows a hybrid "DUI" (Document UI) aesthetic, blending retro terminal vibes with a modern editorial layout.

## 🏗️ Technical Architecture & Assets

All blog posts MUST link to the core shared assets to maintain consistency:

```html
<!-- Styles -->
<link rel="stylesheet" href="../assets/css/blog-common.css" />

<!-- Scripts (at end of body) -->
<script src="../assets/js/blog-common.js"></script>
<script src="../assets/js/resource-cache-data.js"></script>
<script src="../assets/js/resource-preview.js"></script>
```

---

## 🎨 Design System

### 1. Color Palettes

- **Light Mode ("Old Paper"):**
  - Background: `#E2DFD6` (Warm Paper)
  - Cards: `#EBE8DF`
  - Text: `#262626` (Charcoal)
  - Accents: `#2A5D9C` (Classic Navy)
  - Borders: `#CFCBC2`
- **Dark Mode ("Retro Terminal"):**
  - Background: `#000000` (Pure Black)
  - Cards: `#0f0f0f`
  - Text: `#6BA4D9` (Terminal Blue)
  - Accents: `#5682B1` (Steel Blue)
  - Borders: `#4A7091`

### 2. Typography

- **Logos:** `Press Start 2P` (Pixel Font)
- **Display/Headers:** `Space Grotesk` (700 weight for H2)
- **Body Text:** `EB Garamond` (Serif, font-size 1.15rem, line-height 1.7)
- **Technical UI/Labels:** `Share Tech Mono`
- **Code:** `JetBrains Mono`

---

## 📐 Layout Structure

### 1. Header & Hero

- **Header:** Sticky top, `BIT by BIT` pixel logo, theme toggle.
- **Hero Section:** Full-width. 55/45 split.
  - **Left:** Large `H1` (Space Grotesk, punchy), Subtitle (Serif).
  - **Right:** High-impact visualization (SVG animation, CSS 3D, or retro computer scene). Avoid generic stock images. Use `hero-viz-container`.

### 2. Main Body (2-Column)

- **Max Width:** 1400px centered.
- **Sidebar (280px):** Sticky TOC.
  - TOC Markers: `+` (default), `→` (active).
  - Mini Title that fades in on scroll.
- **Content Column (1000px):**
  - H2 Headers: Uppercase, Mono font, `border-bottom` 1px.
  - Paragraphs: Max 4 sentences for readability.
  - Callouts: Sharp corners, distinct accent border.

### 3. Official Resources (NEW)

A grid of "pinned note" cards before the recommendations.

- **Class:** `.resource-card`
- **Elements:** `.mini-clip` (SVG paperclip), `.resource-site` (Label), `.resource-header` (Title), `.resource-desc` (Short snippet).
- **Aesthetic:** Subtle random rotation (`rotate(1.5deg)`), hard shadows, CRT/Paper thumbnail filters (handled by `resource-preview.js`).

---

## ✍️ Content & Writing Tone

- **Hook:** Start with the "Why now?" – quantify the impact (e.g., "1M tokens", "50% cheaper").
- **Voice:** "Pair-Programmer" tone. Technical, honest about trade-offs, direct.
- **Visual Evidence:** Use CSS-only visualizations to explain concepts (isometric document stacks, flowing data streams, network nodes).
- **Benchmarks:** Use comparison tables or callouts to show quantifiable improvements.

---

## 🚀 Generation Workflow

When generating a new post:

1.  **Extract Core Sections:**
    - Introduction
    - The Problem (Technical debt/cost/bottleneck)
    - Deep Dive / Architecture
    - Real-World Use Cases
    - Official Resources (Citations)
    - Recommendations (Internal links)

2.  **Visualization Ideas:**
    - Propose a CSS-based visualization for the Hero section.
    - Propose an interactive or animated diagram for the main technical section.

3.  **Technical Verification:**
    - Use `resource-cache-data.js` for thumbnails.
    - Ensure all code blocks have correct language labels.
    - Double-check reading time vs actual word count.

---

## 📱 Responsive Checklist

- **Tablet (<1024px):** Hide sidebar, stack hero (viz below text).
- **Mobile (<768px):** Tighter margins, 2-col metadata grid.
- **Small Mobile (<480px):** Injected Negative margins for edge-to-edge content blocks.
- **Mobile TOC:** Bottom sheet with drag handle, auto-populates from desktop TOC.

---

## Final Review

- [ ] No rounded corners (`border-radius: 0` everywhere except certain UI icons).
- [ ] Typography follows the Serif/Sans split.
- [ ] Dark mode text is "Terminal Blue" (#6BA4D9), NOT white.
- [ ] Official Resources have the `mini-clip` SVG.
- [ ] `resource-preview.js` and `resource-cache-data.js` are included.
