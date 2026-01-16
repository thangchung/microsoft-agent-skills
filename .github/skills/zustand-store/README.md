# Zustand Store Skill

This skill provides templates and patterns for creating Zustand stores in CoreAI DIY.

## Files

- `template.ts` - Complete store template with subscribeWithSelector

## Key Patterns

### Always use subscribeWithSelector
```typescript
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useMyStore = create<MyStore>()(
  subscribeWithSelector((set, get) => ({
    // state and actions
  }))
);
```

### Separate State and Actions interfaces
```typescript
export interface MyState {
  items: Item[];
  isLoading: boolean;
}

export interface MyActions {
  addItem: (item: Item) => void;
  loadItems: () => Promise<void>;
}

export type MyStore = MyState & MyActions;
```

### Use individual selectors in components
```typescript
// Good - only re-renders when `items` changes
const items = useMyStore((state) => state.items);

// Avoid - re-renders on any state change
const { items, isLoading } = useMyStore();
```

## Checklist

After creating a new store:

1. [ ] Create store in `src/frontend/src/store/`
2. [ ] Export from `src/frontend/src/store/index.ts`
3. [ ] Add tests in `src/frontend/src/store/*.test.ts`
