# Blog Post Creation Template - Bit by Bit Series

Use this template to create new blog posts following the established design language and structure.

## Design System Requirements

### Color Scheme

- **Light Mode (Default):**
  - Background: `#ffffff`
  - Text: `#111111` / `#666666`
  - Accent: `#2A5D9C` (Classic Blue)
  - Borders: `#E5E5E5`

- **Dark Mode:**
  - Background: `#000000`
  - Text: `#739EC9` / `#5682B1` (Blue tones)
  - Accent: `#5682B1` (Steel Blue)
  - Borders: `#5682B1`

### Typography

- **Headings:** Space Grotesk (display font)
- **Body Text:** EB Garamond (serif)
- **Code/Labels:** Share Tech Mono / JetBrains Mono
- **Logo:** Press Start 2P (pixel font)

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Header (BIT by BIT logo + theme toggle)             │
├─────────────────────────────────────────────────────┤
│ Hero Section (Full Width)                           │
│  ├─ Left (55%): Title, Subtitle                     │
│  └─ Right (45%): Image + Metadata                   │
├──────────────┬──────────────────────────────────────┤
│ Sidebar      │ Main Content                         │
│ (280px)      │ (Max 1000px width)                   │
│              │                                      │
│ - Mini Title │ - Article body                       │
│ - TOC        │ - Code blocks                        │
│              │ - Callouts                           │
│              │ - Recommendations                    │
├──────────────┴──────────────────────────────────────┤
│ Footer (T. signature + copyright)                   │
└─────────────────────────────────────────────────────┘
```

**Max Content Width:** 1400px (centered)

---

## Content Template

### 1. Hero Section

```markdown
**Category Label:** // [CATEGORY_NAME] (e.g., DATA_FORMAT_REVOLUTION)
**Title:** [Main Topic - Keep it punchy and uppercase if possible]
**Subtitle:** [One-sentence explanation of what the topic is about]
```

**Example:**

- Category: `// DATA_FORMAT_REVOLUTION`
- Title: `TOON: The Data Format That Saves Tokens`
- Subtitle: `Token-Oriented Object Notation (TOON) is a new data format designed to be more efficient than JSON when communicating with Large Language Models.`

### 2. Metadata (Right Column)

- **Date:** YYYY.MM.DD format
- **Time:** X Min Read
- **Series:** "Bit by Bit"
- **Tags:** 2-3 relevant tags (e.g., AI / ML, Web Dev, etc.)

### 3. Table of Contents (Sidebar)

Create 4-6 main sections with descriptive names:

```
- Introduction
- [Problem Statement]
- [How It Works / Architecture]
- [Comparison / Benefits]
- [When to Use / Applications]
- [Limitations / Challenges]
```

### 4. Article Structure

#### Introduction (1-2 paragraphs)

- Hook the reader with a relatable problem or observation
- Introduce the main concept
- Preview the value proposition

#### Problem Section

- Clearly define the problem being solved
- Use bullet points for clarity
- Include a **Callout Box** for key insights or statistics

**Callout Template:**

```html
<div class="callout">
  <div class="callout-title">
    [Icon] Key Insight / Real Impact / Important Note
  </div>
  <p>[Important information that highlights impact or significance]</p>
</div>
```

#### Technical Explanation

- Break down how the solution works
- Use **Code Blocks** for examples:

```html
<div class="code-block">
  <span class="code-label">// [LANGUAGE] Example ([DESCRIPTOR])</span>
  <code>[Your code here with proper syntax highlighting]</code>
</div>
```

- Include **before/after comparisons** when relevant
- Keep paragraphs to 2-4 sentences max for readability

#### Comparison / Why It Matters

- Quantify benefits (e.g., "50% reduction", "2x faster")
- Compare to alternatives
- Use real-world scenarios

#### Practical Applications

- When/where to use it
- Best practices
- Use cases as bullet points

#### Limitations

- Be honest about weaknesses
- When NOT to use it
- Current state of tooling/adoption

### 5. Recommendations Section

Include 2 related articles/resources:

```html
<div class="recommendations-grid">
  <a href="[URL]" class="rec-card">
    <span class="rec-meta">[Type: Tool/Concept/Tutorial]</span>
    <h3>[Resource Title]</h3>
    <p class="rec-excerpt">[Brief description]</p>
  </a>
</div>
```

---

## Writing Style Guidelines

### Tone

- **Professional but approachable** - like explaining to a smart colleague
- **Direct and concise** - respect the reader's time
- **Technically accurate** - no hand-waving
- **Honest** - acknowledge limitations and trade-offs

### Language

- Use **bold** for key terms and emphasis
- Use `code formatting` for technical terms, variables, file names
- Keep sentences crisp (max 25-30 words)
- Use active voice
- Break up text with headers, lists, and code blocks

### Technical Depth

- **Explain, don't assume** - define acronyms on first use
- **Balance theory and practice** - explain WHY and HOW
- **Use examples liberally** - concrete beats abstract
- **Include actual code** - not pseudocode when possible

---

## SEO & Metadata Best Practices

### Title

- 50-60 characters
- Include main keyword
- Make it clickable (promise value)

### Subtitle/Meta Description

- 120-155 characters
- Expand on what the reader will learn
- Include secondary keywords

### Section Headers (H2)

- Use descriptive, keyword-rich headers
- Keep them scannable
- Use parallel structure (all questions, all statements, etc.)

### Image Alt Text (if adding custom images)

- Descriptive and keyword-rich
- Explain what the image shows

---

## Prompt Template for AI Generation

```
Create a technical blog post for the "Bit by Bit" series about [TOPIC].

**Topic:** [Main Subject]
**Target Audience:** [Software Engineers / Data Scientists / Web Developers / etc.]
**Technical Level:** [Beginner / Intermediate / Advanced]

**Required Structure:**
1. Hero Section
   - Category: // [CATEGORY_TAG]
   - Title: [Punchy, uppercase-friendly title]
   - Subtitle: [One-sentence explanation]

2. Metadata
   - Series: Bit by Bit
   - Tags: [3 relevant tags]
   - Estimated read time: [X] minutes

3. Article Sections
   - Introduction: [Hook + context]
   - Problem: [What challenge does this solve?]
   - How It Works: [Technical explanation with code examples]
   - Comparison: [Benefits, trade-offs]
   - When to Use: [Practical applications]
   - Limitations: [Honest drawbacks]

4. Recommendations: [2 related resources]

**Design Requirements:**
- **Strictly Sharp Corners:** All UI elements (tags, code blocks, images, buttons) must have `border-radius: 0`. No rounded corners.
- **Color Scheme:** Use the blue color scheme (#2A5D9C light, #5682B1 dark).
- **Sidebar Markers:** TOC links must use `+` for default state and `→` for active state (font size 14px).
- **Layout:** Content max-width 1400px centered.
- **Code Blocks:** Sharp corners, no negative margins (except on mobile), proper labels.
- **Delimiters:** Use simple 1px solid line dividers between major sections.
- **Callouts:** Sharp corners, minimal style.
- **Typography:** Consistent with Bit by Bit series (Grotesk headers, Serif body, Mono technical data).
- **Responsive Behavior:**
  - **>1300px:** Spacious 2-column layout.
  - **<1024px (Tablet):** Single column. Hero image sits BELOW text (`order: 0`). Sidebar (`.meta-sidebar`) is HIDDEN (`display: none`). Remove side padding on main column.
  - **<768px (Mobile):** Hero metadata grid uses 2 columns (`repeat(2, 1fr)`). Tighter spacing.
  - **<480px (Small Mobile):** Edge-to-edge code blocks/callouts (negative margins). Scaled down typography.

**Tone:** Professional, direct, technically accurate, honest about trade-offs

**Special Instructions:**
[Any topic-specific requirements or focus areas]
```

---

## Example Topics for Future Posts

- **Web Technologies:** WebAssembly, Service Workers, Web Components
- **Data Science:** Model Compression, Quantization, ONNX Runtime
- **DevOps:** Container Orchestration, CI/CD Patterns, Infrastructure as Code
- **Architecture:** Microservices, Event Sourcing, CQRS
- **Performance:** Tree Shaking, Code Splitting, Lazy Loading
- **Security:** Zero Trust Architecture, OAuth 2.1, WebAuthn

---

## File Naming Convention

`[topic-slug]-blog.html`

Examples:

- `toon-blog.html`
- `webassembly-blog.html`
- `event-sourcing-blog.html`

---

## Final Checklist

Before publishing:

- [ ] Hero section is complete with all metadata
- [ ] TOC matches all H2 sections
- [ ] Code blocks have labels and proper formatting
- [ ] At least 1 callout box for emphasis
- [ ] 2 recommendation cards at the end
- [ ] Footer has "T." signature
- [ ] Theme toggle works (test light/dark modes)
- [ ] Content respects 1400px max-width boundary
- [ ] No horizontal overflow on any element
- [ ] All links are functional
- [ ] All internal anchors (#intro, #problem, etc.) work
- [ ] Reading time is accurate (150-200 words per minute)
