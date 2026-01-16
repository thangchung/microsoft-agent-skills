# Microsoft Foundry NextGen Design Tokens

Complete design token reference for the NextGen Design System.

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Shadows & Elevation](#shadows--elevation)
5. [Motion](#motion)

---

## Color Palette

### Brand Purple Ramp

The primary brand color is a purple gradient scale from near-black to light lavender.

| Token | Hex | Usage |
|-------|-----|-------|
| brand-10 | #030206 | Primary background, darkest |
| brand-20 | #1A1326 | Secondary background, cards |
| brand-30 | #2B1D44 | Surface, elevated panels |
| brand-40 | #38255E | Hover states on dark surfaces |
| brand-50 | #472E79 | Active states, selected items |
| brand-60 | #553695 | Muted accent |
| brand-70 | #643FB2 | Secondary accent |
| brand-80 | #8251EE | **Primary accent** - buttons, links |
| brand-90 | #8251EE | Primary accent (alias) |
| brand-100 | #9263F1 | Hover on primary accent |
| brand-110 | #A175F3 | Light accent |
| brand-120 | #AF86F5 | Secondary text |
| brand-130 | #BC98F7 | Muted text |
| brand-140 | #C9AAF9 | Placeholder text |
| brand-150 | #D5BCFB | Disabled text |
| brand-160 | #E1CEFC | Primary text, lightest |

### Semantic Color Mappings

```css
/* Backgrounds */
--color-background-page: var(--brand-10);        /* #030206 */
--color-background-card: var(--brand-20);        /* #1A1326 */
--color-background-surface: var(--brand-30);     /* #2B1D44 */
--color-background-elevated: var(--brand-40);    /* #38255E */
--color-background-selected: var(--brand-50);    /* #472E79 */

/* Foregrounds */
--color-text-primary: var(--brand-160);          /* #E1CEFC */
--color-text-secondary: var(--brand-120);        /* #AF86F5 */
--color-text-muted: var(--brand-130);            /* #BC98F7 */
--color-text-disabled: var(--brand-150);         /* #D5BCFB */
--color-text-inverse: var(--brand-10);           /* #030206 */

/* Interactive */
--color-interactive-primary: var(--brand-80);    /* #8251EE */
--color-interactive-hover: var(--brand-100);     /* #9263F1 */
--color-interactive-pressed: var(--brand-70);    /* #643FB2 */
--color-interactive-focus: var(--brand-80);      /* #8251EE */
```

### Status Colors

| Status | Foreground | Background | Border |
|--------|------------|------------|--------|
| Success | #0F7B0F | #1B4D1B | #2E7D32 |
| Warning | #F7931E | #4D3D1B | #FF9800 |
| Error | #D32F2F | #4D1B1B | #F44336 |
| Info | #8251EE | #2B1D44 | #8251EE |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| CTA Magenta | #E91E8C | Call-to-action buttons, Create actions |
| CTA Magenta Hover | #FF4DA6 | Hover state for CTA |
| Link Blue | #6BB3FF | Hyperlinks in content |

---

## Typography

### Font Stack

```css
--font-family-base: 'Segoe UI Variable', 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
--font-family-mono: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
```

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| display-lg | 32px | 40px | 600 | Page titles |
| display-md | 24px | 32px | 600 | Section headers |
| title-lg | 20px | 28px | 600 | Card titles |
| title-md | 16px | 24px | 600 | Subsection titles |
| body-lg | 16px | 24px | 400 | Large body text |
| body-md | 14px | 20px | 400 | Default body text |
| body-sm | 12px | 16px | 400 | Small text, captions |
| label | 12px | 16px | 600 | Form labels, badges |
| code | 13px | 20px | 400 | Code blocks |

### Font Weights

```css
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

---

## Spacing & Layout

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| spacing-xxs | 2px | Tight gaps, icon padding |
| spacing-xs | 4px | Badge padding, tight spacing |
| spacing-sm | 8px | Component internal spacing |
| spacing-md | 16px | Default spacing, card padding |
| spacing-lg | 24px | Section spacing |
| spacing-xl | 32px | Large section gaps |
| spacing-2xl | 48px | Page sections |
| spacing-3xl | 64px | Major layout divisions |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-none | 0px | Square corners |
| radius-sm | 4px | Buttons, badges, inputs |
| radius-md | 8px | Cards, panels |
| radius-lg | 12px | Modals, large containers |
| radius-xl | 16px | Hero sections |
| radius-full | 9999px | Pills, avatars |

### Layout Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

---

## Shadows & Elevation

### Shadow Scale

```css
/* Elevation levels */
--shadow-none: none;
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);

/* Component-specific */
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.4);
--shadow-dropdown: 0 4px 16px rgba(0, 0, 0, 0.5);
--shadow-modal: 0 8px 32px rgba(0, 0, 0, 0.6);
--shadow-focus: 0 0 0 2px var(--brand-80);
```

### Elevation Layers

| Layer | Z-Index | Usage |
|-------|---------|-------|
| base | 0 | Page content |
| dropdown | 100 | Dropdowns, popovers |
| sticky | 200 | Sticky headers |
| modal | 300 | Modal dialogs |
| toast | 400 | Toast notifications |
| tooltip | 500 | Tooltips |

---

## Motion

### Duration

```css
--duration-instant: 0ms;
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 400ms;
```

### Easing

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Common Transitions

```css
--transition-colors: color var(--duration-fast) var(--ease-default),
                     background-color var(--duration-fast) var(--ease-default),
                     border-color var(--duration-fast) var(--ease-default);
--transition-opacity: opacity var(--duration-normal) var(--ease-default);
--transition-transform: transform var(--duration-normal) var(--ease-out);
--transition-all: all var(--duration-normal) var(--ease-default);
```
