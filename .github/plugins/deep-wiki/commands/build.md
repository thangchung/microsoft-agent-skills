---
description: Package generated wiki pages into a VitePress site with dark theme, dark-mode Mermaid diagrams, and click-to-zoom
---

# Deep Wiki: Build VitePress Site

Package the generated wiki markdown files into a complete VitePress site with a Daytona-inspired dark theme, dark-mode Mermaid diagrams, and click-to-zoom for diagrams and images.

## Prerequisites

The wiki markdown files should already exist (from `/deep-wiki:generate` or manual creation). This command scaffolds the VitePress project around them.

## Step 1: Scaffold VitePress Project

Create a `wiki/` directory with this structure:

```
wiki/
├── package.json
├── .gitignore
├── AGENTS.md                          # Agent instructions for wiki folder
├── CLAUDE.md                          # Companion pointer to AGENTS.md
├── index.md                          # Wiki home page (NOT a placeholder — see below)
├── llms.txt                          # LLM-friendly links + descriptions
├── llms-full.txt                     # LLM-friendly full inlined content
├── onboarding/                        # Audience-tailored onboarding guides
│   ├── index.md                       # Onboarding hub with guide selector
│   ├── contributor-guide.md           # For new contributors (assumes Python/JS)
│   ├── staff-engineer-guide.md        # For staff/principal engineers
│   ├── executive-guide.md             # For VP/director-level leaders
│   └── product-manager-guide.md       # For product managers
├── {NN}-{section-name}/              # Numbered section folders
│   ├── {page-name}.md
│   └── ...
├── .vitepress/
│   ├── config.mts                    # Full VitePress config
│   ├── public/
│   │   ├── logo.svg                  # Brand logo
│   │   ├── llms.txt                  # Served at /llms.txt on deployed site
│   │   └── llms-full.txt             # Served at /llms-full.txt on deployed site
│   └── theme/
│       ├── index.ts                  # Theme setup (zoom handlers)
│       └── custom.css                # Complete dark theme + Mermaid + zoom CSS
```

### index.md — Wiki Landing Page (CRITICAL)

The `index.md` MUST be a proper, content-rich wiki home page — **NEVER a generic placeholder**. It serves as the main entry point for both VitePress and ADO Wiki exports.

Generate `index.md` with:
- **Project title** as `# heading`
- **Overview paragraph** — what the project does, its purpose, key technologies (1-2 sentences)
- **Quick Navigation table** — Section, Description columns linking to all top-level wiki sections
- **Links to onboarding guides** (if they exist) — prominently placed
- **Architecture overview diagram** — a high-level Mermaid `graph LR` showing major system components (reuse from the architecture page)
- **Key technologies table** — Technology, Purpose, Source columns

For VitePress, the `index.md` can optionally include a `hero:` block in front matter, but the markdown body below it must contain the full landing page content (so it survives ADO conversion which strips front matter).

### package.json

```json
{
  "name": "wiki",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview"
  },
  "devDependencies": {
    "medium-zoom": "^1.1.0",
    "mermaid": "^11.12.2",
    "vitepress": "^1.6.4",
    "vitepress-plugin-mermaid": "^2.0.17"
  }
}
```

### .gitignore

```
node_modules/
.vitepress/cache/
.vitepress/dist/
```

## Step 2: VitePress Config (config.mts)

The config MUST:
- Use `withMermaid()` wrapper from `vitepress-plugin-mermaid`
- Set `ignoreDeadLinks: true` (wiki pages reference internal source paths)
- Load Inter + JetBrains Mono fonts via head link
- Set `appearance: 'dark'` for dark-only mode
- Configure sidebar dynamically from generated section structure
- Include ONBOARDING section first (uncollapsed) with both guides
- Set `outline: { level: [2, 3] }`
- Enable `markdown: { lineNumbers: true }`
- Include `vite: { optimizeDeps: { include: ['mermaid'] } }`
- Set comprehensive Mermaid dark-mode `themeVariables`:

```typescript
mermaid: {
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#0d1117',
    primaryColor: '#2d333b',
    primaryTextColor: '#e6edf3',
    primaryBorderColor: '#6d5dfc',
    secondaryColor: '#1c2333',
    secondaryTextColor: '#e6edf3',
    secondaryBorderColor: '#6d5dfc',
    tertiaryColor: '#161b22',
    tertiaryTextColor: '#e6edf3',
    tertiaryBorderColor: '#30363d',
    lineColor: '#8b949e',
    textColor: '#e6edf3',
    mainBkg: '#2d333b',
    nodeBkg: '#2d333b',
    nodeBorder: '#6d5dfc',
    nodeTextColor: '#e6edf3',
    clusterBkg: '#161b22',
    clusterBorder: '#30363d',
    titleColor: '#e6edf3',
    edgeLabelBackground: '#1c2333',
    actorBkg: '#2d333b',
    actorTextColor: '#e6edf3',
    actorBorder: '#6d5dfc',
    actorLineColor: '#8b949e',
    signalColor: '#e6edf3',
    signalTextColor: '#e6edf3',
    labelBoxBkgColor: '#2d333b',
    labelBoxBorderColor: '#6d5dfc',
    labelTextColor: '#e6edf3',
    loopTextColor: '#e6edf3',
    activationBorderColor: '#6d5dfc',
    activationBkgColor: '#1c2333',
    sequenceNumberColor: '#e6edf3',
    noteBkgColor: '#2d333b',
    noteTextColor: '#e6edf3',
    noteBorderColor: '#6d5dfc',
    classText: '#e6edf3',
    labelColor: '#e6edf3',
    altBackground: '#161b22',
  },
},
```

### Dynamic Sidebar Generation

Scan the generated markdown files and build sidebar config:
- ONBOARDING section always first (uncollapsed) with four audience-tailored guides: Contributor, Staff Engineer, Executive, Product Manager
- Then numbered sections: `01-getting-started`, `02-architecture`, etc.
- Each section becomes a collapsible group
- First 3-4 sections uncollapsed, rest collapsed

## Step 3: Theme Setup (theme/index.ts)

Implement two zoom systems:

### Image Zoom (medium-zoom)
```typescript
import mediumZoom from 'medium-zoom'
// Apply to all images: mediumZoom('.vp-doc img:not(.no-zoom)', { background: 'rgba(0, 0, 0, 0.92)' })
```

### Mermaid Diagram Zoom (custom SVG overlay)

Mermaid renders `<svg>`, not `<img>`, so medium-zoom won't work. Build a custom fullscreen overlay:
- **Clone the SVG** (don't move it) into the overlay
- **Zoom controls**: +, −, Reset buttons + keyboard shortcuts (+, -, 0)
- **Scroll wheel zoom**: Passive-false wheel event listener
- **Pan**: Mousedown drag on the content area
- **Keyboard**: Escape to close
- **Backdrop click**: Click outside to close
- **ViewBox fix**: If SVG has no viewBox, compute one from `getBBox()`

**CRITICAL**: Use `setup()` with `onMounted` + route watcher, NOT `enhanceApp()` (DOM doesn't exist yet during SSR).

**Mermaid async rendering**: Diagrams are rendered asynchronously by `vitepress-plugin-mermaid`. The SVGs don't exist when `onMounted` fires. **Poll for them** with retry (up to 20 attempts × 500ms).

## Step 4: Dark Theme CSS (theme/custom.css)

### Typography
- `--vp-font-family-base: 'Inter'`
- `--vp-font-family-mono: 'JetBrains Mono'`

### Color Palette
| Element | Background | Border | Text |
|---------|-----------|--------|------|
| Page background | `#0d1117` | — | `#e6edf3` |
| Elevated surface | `#161b22` | `#30363d` | `#e6edf3` |
| Card/node | `#2d333b` | `#6d5dfc` | `#e6edf3` |
| Secondary surface | `#1c2333` | `#6d5dfc` | `#e6edf3` |
| Lines/arrows | — | `#8b949e` | — |
| Brand accent | — | `#6d5dfc` | — |
| Muted text | — | — | `#8b949e` |

### Required CSS Sections
1. Dark-mode VitePress variables (backgrounds, surfaces, text, brand, code blocks, scrollbar)
2. Layout — wider content area (`max-width: 820px`)
3. Navbar — border, background fixes
4. Sidebar — uppercase section titles, active item with left border accent
5. Content typography — h1-h3, p, li, strong sizing
6. Inline code — soft background, brand color text
7. Code blocks — dark background, rounded, language labels
8. Tables — alternating row colors, uppercase headers
9. Mermaid containers — centered, padded, bordered, dark background

### Mermaid Dark-Mode CSS Overrides (CRITICAL)

Theme variables don't cover everything. Force dark fills on all SVG shapes:

```css
.mermaid .node rect, .mermaid .node circle, .mermaid .node ellipse,
.mermaid .node polygon, .mermaid .node path, .mermaid .label-container {
  fill: #2d333b !important;
  stroke: #6d5dfc !important;
}
.mermaid .nodeLabel, .mermaid .node text, .mermaid text, .mermaid span {
  color: #e6edf3 !important;
  fill: #e6edf3 !important;
}
.mermaid .cluster rect { fill: #161b22 !important; stroke: #30363d !important; }
.mermaid .actor { fill: #2d333b !important; stroke: #6d5dfc !important; }
.mermaid .edgeLabel rect { fill: #1c2333 !important; }
.mermaid .flowchart-link, .mermaid .messageLine0, .mermaid .messageLine1, .mermaid line {
  stroke: #8b949e !important;
}
.mermaid marker path { fill: #8b949e !important; }
```

### Zoom CSS
- Mermaid hover hint: glow border + "🔍 Click to zoom" badge on hover
- Fullscreen overlay: backdrop blur, centered container, zoom controls, pan cursor
- Image hover: subtle glow + scale on hover
- medium-zoom overlay: dark background with blur

## Step 5: Post-Processing (Markdown Fixes)

Before building, fix common issues in generated markdown:

### Fix Mermaid Inline Styles
Scan for light-mode `style` directives in Mermaid blocks and replace with dark equivalents:
- `#e1f5ff` → `#1a3a4a`, `#e8f5e9` → `#1a3a20`, `#fff3e0` → `#3a3020`
- `#f3e5f5` → `#2a1a3a`, `#f5f5f5` → `#2d333b`, `#ffffff` → `#2d333b`
- Add `,color:#e6edf3` for text visibility

### Escape Generics Outside Code Fences
Wrap bare generics (`Task<string>`, `List<T>`) in backticks outside code fences. Vue's template compiler treats bare `<T>` as HTML tags.

### Fix `<br/>` in Mermaid
Replace `<br/>` with `<br>` in Mermaid blocks (self-closing tags cause Vue compilation errors).

### Validate Hex Colors
Check all hex colors in Mermaid blocks are valid (3 or 6 digits, not 4 or 5).

## Step 6: Build

```bash
cd wiki && npm install && npm run build
```

Output goes to `wiki/.vitepress/dist/`. For preview: `npm run preview`.

## Logo SVG

```svg
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#6d5dfc"/>
  <path d="M8 22V10l8-4 8 4v12l-8 4-8-4z" fill="#0d1117" fill-opacity="0.3"/>
  <path d="M16 6l8 4v12l-8 4-8-4V10l8-4z" stroke="white" stroke-width="1.5" fill="none"/>
  <circle cx="16" cy="14" r="3" fill="white"/>
  <path d="M12 20l4-3 4 3" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

$ARGUMENTS
