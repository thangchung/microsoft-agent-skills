---
name: foundry-nextgen-frontend
description: Build elegant frontend UIs following Microsoft Foundry's NextGen Design System using Vite + React + pnpm. Use when creating dashboards, agent builders, data grids, entity management interfaces, or any application matching Foundry's refined dark-themed, purple-accented aesthetic. Triggers on requests for Foundry-style UI, NextGen design system, Microsoft Foundry interfaces, or enterprise admin dashboards with data tables, detail panels, and charts.
---

# Microsoft Foundry NextGen Frontend Skill

Build elegant, production-ready interfaces following Microsoft Foundry's NextGen Design System - a refined dark-themed design language with purple brand accents built on Fluent 2 principles.

## Preferred Stack

**Vite + React + pnpm** - Fast, modern, elegant.

```bash
pnpm create vite@latest my-foundry-app --template react-ts
cd my-foundry-app
pnpm install
pnpm add @fluentui/react-components @fluentui/react-icons
```

## When to Use

- Building Microsoft Foundry-style interfaces
- Creating agent builder UIs, entity management dashboards
- Implementing data grids with detail panels
- Any enterprise UI requiring elegant dark theme with purple brand colors

## Quick Reference

### Core Design Tokens

```css
:root {
  /* Brand Purple Scale */
  --brand-10: #030206;
  --brand-20: #1A1326;
  --brand-30: #2B1D44;
  --brand-40: #38255E;
  --brand-50: #472E79;
  --brand-60: #553695;
  --brand-70: #643FB2;
  --brand-80: #8251EE;
  --brand-90: #8251EE;
  --brand-100: #9263F1;
  --brand-110: #A175F3;
  --brand-120: #AF86F5;
  --brand-130: #BC98F7;
  --brand-140: #C9AAF9;
  --brand-150: #D5BCFB;
  --brand-160: #E1CEFC;

  /* Semantic Colors */
  --background-primary: #030206;
  --background-secondary: #1A1326;
  --background-surface: #2B1D44;
  --foreground-primary: #E1CEFC;
  --foreground-secondary: #AF86F5;
  --accent-primary: #8251EE;
  --accent-cta: #E91E8C;

  /* Status Colors */
  --status-success: #0F7B0F;
  --status-success-bg: #1B4D1B;
  --status-warning: #F7931E;
  --status-warning-bg: #4D3D1B;
  --status-error: #D32F2F;
  --status-error-bg: #4D1B1B;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Typography */
  --font-family: 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif;
  --font-size-sm: 12px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
}
```

### Component Quick Start

**Badge**: `<Badge color="success|warning|error" appearance="filled|outline" size="small|medium|large">`

**Button**: Primary (purple filled), Secondary (outline), with optional icon-only mode

**DataGrid**: Table with sortable columns, row selection, pagination, integrated search

See `references/components.md` for full component specs.

## Workflow

1. **Identify the pattern**: Dashboard, entity list, agent builder, detail panel?
2. **Apply design tokens**: Use CSS variables from above
3. **Use correct components**: Match Fluent 2 patterns with NextGen styling
4. **Follow layout patterns**: See `references/patterns.md`

## Key Principles

1. **Dark-first design**: Background is near-black (#030206), surfaces use purple-tinted darks
2. **Purple brand accent**: Primary actions use #8251EE, CTAs can use magenta #E91E8C
3. **Subtle depth**: Use shadow and surface elevation, not borders
4. **Dense but readable**: Enterprise UIs balance information density with whitespace
5. **Fluent 2 compliance**: Components follow Fluent 2 specs with NextGen color theming

## File References

- **Design Tokens**: See `references/design-tokens.md` for complete color, typography, and spacing scales
- **Components**: See `references/components.md` for Badge, Button, DataGrid, Tabs, Input, Panel specs
- **Patterns**: See `references/patterns.md` for page layouts (Entity List, Agent Builder, Dashboard)

## Logo Assets

- **Dark theme**: `assets/foundry-logo-dark.png` - 3D metallic purple logo with glow
- **Light theme**: `assets/foundry-logo-light.png` - Dotted/halftone monochrome logo

## React + Vite Implementation

### Project Setup

```bash
pnpm create vite@latest foundry-app --template react-ts
cd foundry-app
pnpm add @fluentui/react-components @fluentui/react-icons
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx tailwindcss init -p
```

### Theme Configuration

```tsx
// src/theme/foundryTheme.ts
import { createDarkTheme, BrandVariants } from '@fluentui/react-components';

const foundryBrand: BrandVariants = {
  10: '#030206',
  20: '#1A1326',
  30: '#2B1D44',
  40: '#38255E',
  50: '#472E79',
  60: '#553695',
  70: '#643FB2',
  80: '#8251EE',
  90: '#8251EE',
  100: '#9263F1',
  110: '#A175F3',
  120: '#AF86F5',
  130: '#BC98F7',
  140: '#C9AAF9',
  150: '#D5BCFB',
  160: '#E1CEFC',
};

export const foundryTheme = createDarkTheme(foundryBrand);

// Refined overrides for elegance
foundryTheme.colorNeutralBackground1 = '#030206';
foundryTheme.colorNeutralBackground2 = '#1A1326';
foundryTheme.colorNeutralBackground3 = '#2B1D44';
foundryTheme.colorBrandBackground = '#8251EE';
foundryTheme.colorBrandBackgroundHover = '#9263F1';
foundryTheme.colorBrandBackgroundPressed = '#643FB2';
```

### App Entry

```tsx
// src/App.tsx
import { FluentProvider } from '@fluentui/react-components';
import { foundryTheme } from './theme/foundryTheme';

export default function App() {
  return (
    <FluentProvider theme={foundryTheme}>
      <div className="min-h-screen bg-[#030206]">
        {/* Your app */}
      </div>
    </FluentProvider>
  );
}
```

## Design Philosophy: Elegant Restraint

1. **Refined, not busy**: Every element earns its place. Remove before adding.
2. **Purposeful motion**: Subtle 200ms transitions. No gratuitous animation.
3. **Breathing room**: Generous whitespace creates sophistication.
4. **Consistent depth**: Use shadow and surface color, never borders for separation.
5. **Typography hierarchy**: Let type scale do the work. Avoid bold overuse.

## Tailwind Configuration

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        foundry: {
          bg: '#030206',
          surface: '#1A1326',
          elevated: '#2B1D44',
          accent: '#8251EE',
          'accent-hover': '#9263F1',
          cta: '#E91E8C',
          text: '#E1CEFC',
          'text-muted': '#AF86F5',
        },
      },
      fontFamily: {
        sans: ['Segoe UI Variable', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

### Usage

```tsx
<button className="bg-foundry-accent hover:bg-foundry-accent-hover text-white px-4 py-2 rounded transition-colors duration-200">
  Primary Action
</button>
```

## Critical Don'ts

- Don't use light backgrounds - dark-theme-only system
- Don't use Inter, Roboto, or generic fonts - use Segoe UI Variable
- Don't use rounded-full buttons - use 4px radius for refinement
- Don't use visible borders - prefer shadow and background elevation
- Don't mix brand purple with other saturated hues (except status colors)
- Don't over-animate - subtlety is elegance
- Don't crowd elements - let the design breathe
