# React Flow Node Skill

This skill provides templates and patterns for creating React Flow node components in CoreAI DIY.

## Files

- `template.tsx` - Complete node component template
- `types.template.ts` - TypeScript type definitions

## Usage

When creating a new node type, use these templates as a starting point. Replace placeholder values:

- `{{NodeName}}` - Component name in PascalCase (e.g., `VideoNode`)
- `{{nodeType}}` - Node type identifier (e.g., `video-node`)
- `{{NodeData}}` - Data interface name (e.g., `VideoNodeData`)

## Checklist

After creating a new node:

1. [ ] Add type to `src/frontend/src/types/index.ts`
2. [ ] Create component in `src/frontend/src/components/nodes/`
3. [ ] Export from `src/frontend/src/components/nodes/index.ts`
4. [ ] Add defaults in `src/frontend/src/store/app-store.ts`
5. [ ] Register in canvas `nodeTypes`
6. [ ] Add to AddBlockMenu and ConnectMenu
