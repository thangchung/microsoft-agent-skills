# Agent Skills

> 🚧 **Work in Progress** — This repository is actively being developed.

A collection of **skills**, **prompts**, **agents**, and **MCP server configurations** designed to supercharge your AI coding agents when working with Microsoft AI SDKs and Azure services.

## What's This About?

Modern coding agents (GitHub Copilot, Claude Code, OpenCode, etc.) are powerful out of the box, but they lack domain-specific knowledge about your SDKs, patterns, and best practices. This repo provides the "onboarding guides" that turn general-purpose agents into specialized experts.

## Repository Structure

```
.github/
├── skills/           # Modular knowledge packages for specific domains
│   ├── azure-ai-search-python/
│   ├── foundry-iq-agent/
│   ├── mcp-builder/
│   └── ...
├── prompts/          # Reusable prompt templates (.prompt.md)
├── agents/           # Agent persona definitions (.agent.md)
├── agents.md         # Project-wide agent instructions
└── copilot-instructions.md

.vscode/
└── mcp.json          # MCP server configurations
```

### Skills

Self-contained packages that extend agent capabilities with:
- **Procedural knowledge** — Step-by-step workflows for complex tasks
- **SDK patterns** — Clean code examples and best practices
- **Tool integrations** — Scripts and references for specific frameworks

Current skills include: `azure-ai-search-python`, `foundry-iq-agent`, `foundry-nextgen-frontend`, `mcp-builder`, `skill-creator`, and more.

### Prompts

Reusable prompt templates for common tasks like code reviews, creating components, and adding endpoints.

### Agents

Persona definitions that give coding agents specific roles and context (e.g., `backend.agent.md`, `frontend.agent.md`, `planner.agent.md`).

### MCP Servers

Pre-configured Model Context Protocol servers in `.vscode/mcp.json` for tools like:
- GitHub, Playwright, Terraform
- Microsoft Docs, DeepWiki, Context7
- Sequential Thinking, Memory, and more

## Quick Start

1. **Clone this repo** into your workspace or copy specific skills you need
2. **Configure your agent** to use the instruction files:
   - For VS Code Copilot: Skills are auto-discovered from `.github/skills/`
   - For Claude: Reference `SKILL.md` files in your project instructions
3. **Use MCP servers** by copying `.vscode/mcp.json` to your project

## Contributing

This is an evolving collection. Feel free to:
- Add new skills for AI SDKs and Azure services
- Improve existing prompts and agent definitions
- Share MCP server configurations that work well

## License

MIT
