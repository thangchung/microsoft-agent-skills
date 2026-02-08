---
description: Generate two onboarding guides for the repository — a Principal-Level guide and a Zero-to-Hero learning path
---

# Deep Wiki: Onboarding Guide Generation

You are creating onboarding documentation for this codebase. Generate **two** comprehensive guides.

## Step 1: Language & Technology Detection

Before writing anything, detect:

1. **Primary language** from file extensions and build files:
   - `*.cs`/`*.csproj` → C#, `*.py`/`pyproject.toml` → Python, `*.go`/`go.mod` → Go
   - `*.ts`/`package.json` → TypeScript, `*.rs`/`Cargo.toml` → Rust, `*.java`/`pom.xml` → Java

2. **Comparison language** for cross-language explanations:
   - C# → Python, Java → Python, Go → Python, TypeScript → Python
   - Python → JavaScript, Rust → C++ or Go, Swift → TypeScript

3. **Key technologies** by scanning for:
   - Orleans/Akka → Actor model, Cosmos/Mongo → Document DB, PostgreSQL/MySQL → RDBMS
   - Redis → Caching, Kafka/RabbitMQ/ServiceBus → Messaging, gRPC/GraphQL → API protocol
   - Docker/K8s → Containers

## Step 2: Generate Principal-Level Onboarding Guide

**Audience**: Senior/Principal IC or engineering leader. Deep systems experience, not necessarily familiar with this repo's language.
**Length**: 800–1200 lines. Dense, opinionated, architectural.

### Required Sections

1. **Executive Summary** — What the system is in one dense paragraph. What it owns vs delegates. Business context.
2. **The Core Architectural Insight** — The SINGLE most important concept. Include pseudocode in a DIFFERENT language from the repo (e.g., Python pseudocode for a C# codebase).
3. **System Architecture** — Full Mermaid diagram (middleware → controllers → services → storage → external). Call out the "heart" of the system.
4. **Domain Model** — ER diagram (Mermaid) of core entities. Data invariants table.
5. **Component Types & Execution Paths** — Table of all major component variants with code path per variant.
6. **Strategic Direction / Roadmap** — Business model context, engineering workstreams, value propositions.
7. **Storage & Data Architecture** — Stores used, data access layer, consistency model.
8. **API Surface & Protocols** — Endpoints table, wire format, auth model.
9. **Configuration & Feature Flags** — How config is layered, feature gating.
10. **Testing & Development** — Test types, dev setup quickstart, key commands.
11. **Key Design Decisions & Tradeoffs** — Why things are the way they are.
12. **Where to Go Deep** — Reading order for source files, links to wiki sections.

### Key Rules
- Use **pseudocode in a different language** to explain concepts
- Use **comparison tables** to map unfamiliar concepts (e.g., `Task<T>` = `Awaitable[T]`)
- Use **Engine vs Car** analogies — what the system delegates vs owns
- Dense prose with tables, NOT shallow bullet lists
- Every claim has a file reference: `(file_path:line_number)`

## Step 3: Generate Zero-to-Hero Learning Path

**Audience**: Engineer possibly new to the repo's primary language. Assumes experience in SOME other language.
**Length**: 1000–2500 lines. Progressive — each section builds on the last.

### Required Structure

**Part I: Foundation Skills**
1. **{Primary Language} for {Other Language} Engineers** — Syntax side-by-side tables, async model, collections, DI, type system. Concrete code comparisons, NOT abstract descriptions.
2. **{Primary Framework} for Web Framework Users** — Compare to equivalent frameworks. Request pipeline, controllers, routing, config, DI container.
3. **{Key Technology 1} from First Principles** — The problem it solves (story format), core concepts with comparisons, how THIS system uses it specifically.
4. **{Key Technology 2} from First Principles** — Same approach for second key technology.
5. **Distributed Systems Essentials** (if applicable) — CAP theorem choices, concurrency, idempotency, streaming.

**Part II: This Codebase**
6. **The Big Picture** — One-sentence summary, Engine vs Car analogy, core entities table.
7. **Architecture Deep Dive** — N-layer pattern, the "heart" file, feature flags.
8. **Domain Model & Data Flow** — ER diagram, data invariants, primary request lifecycle.
9. **Component Types & Execution Paths** — Component variants table, code paths.
10. **Strategic Context** — Roadmap, strategy, product direction (if available).

**Part III: Getting Productive**
11. **Development Environment Setup** — Prerequisites table, step-by-step setup, common mistakes.
12. **Running Tests** — Unit/integration/E2E commands, log querying.
13. **Navigating the Codebase** — "Start here" file reading order, how to trace a request.
14. **Contributing: Conventions & Patterns** — How to add an endpoint, config flag, etc.

**Appendices**
- **Glossary** (40+ terms)
- **Key File Reference** (path, purpose, why it matters)
- **Further Reading** (links to wiki sections)

### Key Rules
- **Progressive depth**: Part I → Part II → Part III. Never reference something before explaining it.
- **First-principles**: Start with "why does this problem exist?" before the solution.
- **Concrete over abstract**: Code examples from the actual codebase.
- **Tables for comparisons**: Language A vs Language B, SQL vs NoSQL, etc.

## Mermaid Diagram Rules

ALL diagrams must use dark-mode colors:
- Node fills: `#2d333b`, borders: `#6d5dfc`, text: `#e6edf3`
- Subgraph backgrounds: `#161b22`, borders: `#30363d`
- Lines: `#8b949e`
- If using inline `style` directives, use dark fills with `,color:#e6edf3`
- Do NOT use `<br/>` in Mermaid labels (use `<br>` or line breaks)

## Validation

After generating each guide, verify:
- All file paths mentioned actually exist in the repo
- All class/method names are accurate (not hallucinated)
- Mermaid diagrams render (no syntax errors)
- No bare HTML-like tags (generics like `List<T>`) outside code fences — wrap in backticks

$ARGUMENTS
