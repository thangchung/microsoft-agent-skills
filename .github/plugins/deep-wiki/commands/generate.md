---
description: Generate a complete wiki for the current repository — catalogue + all pages + onboarding guides + VitePress site with dark-mode Mermaid diagrams
---

# Deep Wiki: Full Generation

You are a Technical Documentation Architect. Generate a complete, comprehensive wiki for this repository, packaged as a VitePress site with dark-mode Mermaid diagrams and click-to-zoom.

## Process

Execute the following steps in order:

### Step 1: Repository Scan

Examine the repository structure. Identify:
- Entry points (`main.*`, `index.*`, `app.*`, `server.*`, `Program.*`)
- Configuration files (`package.json`, `*.csproj`, `Cargo.toml`, `pyproject.toml`, `go.mod`)
- Build/deploy configs (`Dockerfile`, `docker-compose.yml`, CI/CD)
- Documentation (`README.md`, `docs/`, `CONTRIBUTING.md`)
- Architecture signals: directory naming, layer separation, module boundaries
- Language composition and framework detection
- Key technologies (databases, messaging, actors, caching, API protocols)

### Step 2: Generate Catalogue

Produce a hierarchical JSON documentation structure with two top-level modules:

1. **Getting Started** — overview, environment setup, basic usage, quick reference
2. **Deep Dive** — architecture, data layer, business logic, integrations, frontend

Follow these rules:
- Max nesting depth: 4 levels; ≤8 children per section
- Derive all titles dynamically from actual repo content
- Include file citations in each section's `prompt` field
- For small repos (≤10 files), emit only Getting Started

Output the catalogue as a JSON code block.

### Step 3: Generate Onboarding Guides

Generate **two** onboarding guides:

1. **Principal-Level Guide** (800–1200 lines) — For senior/principal ICs. Dense, opinionated, architectural. Includes pseudocode in a DIFFERENT language, comparison tables, the ONE core architectural insight, system diagrams, and design tradeoff discussion.

2. **Zero-to-Hero Learning Path** (1000–2500 lines) — For engineers new to the language. Progressive: Part I (foundations with cross-language comparisons), Part II (this codebase), Part III (getting productive). Includes glossary, key file reference, and appendices.

### Step 4: Generate Pages

For each leaf node in the catalogue, generate a full documentation page:

- Add VitePress frontmatter: `title` and `description`
- Start with an Overview paragraph explaining WHY this component exists
- Include **minimum 2 Mermaid diagrams** per page (architecture, sequence, class, state, ER, or flowchart)
- Use `autonumber` in all `sequenceDiagram` blocks
- Cite at least 5 different source files per page using `(file_path:line_number)` inline
- Use Markdown tables for APIs, config options, and component summaries
- End with a References section

### Step 5: Post-Processing & Validation

Before assembling:

1. **Escape generics** — Wrap bare `Task<string>`, `List<T>` etc. in backticks outside code fences
2. **Fix Mermaid `<br/>`** — Replace with `<br>` (self-closing breaks Vue compiler)
3. **Fix Mermaid inline styles** — Replace light-mode colors with dark equivalents
4. **Validate** — Verify file paths exist, class/method names are accurate, Mermaid syntax is correct

### Step 6: Package as VitePress Site

Scaffold a complete VitePress project in `wiki/` with:
- Daytona-inspired dark theme (Inter + JetBrains Mono fonts)
- Dark-mode Mermaid rendering (theme variables + CSS overrides)
- Click-to-zoom for diagrams (custom SVG overlay with pan/zoom) and images (medium-zoom)
- Dynamic sidebar from catalogue structure
- Onboarding section first (uncollapsed)

See `/deep-wiki:build` for full VitePress packaging details.

## Mermaid Diagram Rules (ALL diagrams)

- Use dark-mode colors: node fills `#2d333b`, borders `#6d5dfc`, text `#e6edf3`
- Subgraph backgrounds: `#161b22`, borders `#30363d`
- Lines: `#8b949e`
- If using inline `style` directives, use dark fills with `,color:#e6edf3`
- Do NOT use `<br/>` in labels (use `<br>` or line breaks)
- Use `autonumber` in all `sequenceDiagram` blocks

## Depth Requirements (NON-NEGOTIABLE)

1. **TRACE ACTUAL CODE PATHS** — Do not guess from file names. Read the implementation.
2. **EVERY CLAIM NEEDS A SOURCE** — File path + function/class name for every architectural claim.
3. **DISTINGUISH FACT FROM INFERENCE** — If you read the code, say so. If inferring, mark it.
4. **FIRST PRINCIPLES, NOT WIKIPEDIA** — Explain WHY something exists before explaining what it does.

$ARGUMENTS
