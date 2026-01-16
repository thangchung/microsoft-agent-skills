# Microsoft Foundry NextGen Components

Elegant component specifications following Fluent 2 patterns with NextGen theming.

## Table of Contents

1. [Badge](#badge)
2. [Button](#button)
3. [Input](#input)
4. [Tabs](#tabs)
5. [DataGrid](#datagrid)
6. [Panel](#panel)
7. [Slider](#slider)
8. [Toggle](#toggle)

---

## Badge

Small, color-coded visual element for labeling, categorizing, or indicating status/severity.

### Variants

| Variant | Color | Background | Usage |
|---------|-------|------------|-------|
| Success | #0F7B0F | #1B4D1B (filled) | Completed, active, healthy |
| Warning | #F7931E | #4D3D1B (filled) | Attention needed, pending |
| Error | #D32F2F | #4D1B1B (filled) | Failed, critical, blocked |
| Info | #8251EE | #2B1D44 (filled) | Informational, neutral |
| On | #0F7B0F | transparent | Boolean on state |
| Off | #888888 | transparent | Boolean off state |

### Appearances

- **Filled**: Solid background with white/light text
- **Outline**: Transparent background with colored border and text

### Sizes

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| Small | 20px | 4px 8px | 11px |
| Medium | 24px | 4px 8px | 12px |
| Large | 28px | 4px 12px | 14px |

### Implementation

```tsx
// React with Fluent UI
import { Badge } from '@fluentui/react-components';

<Badge appearance="filled" color="success" size="medium">
  Complete
</Badge>

// Custom HTML/CSS
<span class="badge badge--success badge--filled">
  <svg class="badge__icon">...</svg>
  Complete
</span>
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.badge--success.badge--filled {
  background: #1B4D1B;
  color: #4ADE80;
}

.badge--success.badge--outline {
  background: transparent;
  border: 1px solid #0F7B0F;
  color: #0F7B0F;
}
```

### Do's and Don'ts

✅ Use badges to highlight status, notifications, or key information
✅ Choose appropriate appearance (status, severity) to match meaning
✅ Use clear, concise text within the badge
✅ Place badge in proximity to the item it relates to

❌ Don't use badges for purely decorative purposes
❌ Don't overuse badges - dilutes their impact
❌ Don't use excessively long text within a badge
❌ Don't rely solely on color to convey meaning - use text or icons

---

## Button

Interactive element for triggering actions.

### Variants

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| Primary | #8251EE | #FFFFFF | none | Main actions |
| Primary (CTA) | #E91E8C | #FFFFFF | none | Create, Submit |
| Secondary | transparent | #E1CEFC | 1px #553695 | Alternative actions |
| Subtle | transparent | #AF86F5 | none | Tertiary actions |
| Danger | #D32F2F | #FFFFFF | none | Destructive actions |

### States

```css
/* Primary Button States */
.btn-primary {
  background: #8251EE;
  color: #FFFFFF;
}
.btn-primary:hover {
  background: #9263F1;
}
.btn-primary:active {
  background: #643FB2;
}
.btn-primary:focus-visible {
  outline: 2px solid #8251EE;
  outline-offset: 2px;
}
.btn-primary:disabled {
  background: #472E79;
  color: #AF86F5;
  cursor: not-allowed;
}
```

### Sizes

| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| Small | 28px | 8px 12px | 12px | 16px |
| Medium | 32px | 8px 16px | 14px | 20px |
| Large | 40px | 12px 24px | 16px | 24px |

### Button with Icon

```tsx
// Icon before text
<Button icon={<AddIcon />}>Create new</Button>

// Icon only (requires aria-label)
<Button icon={<SettingsIcon />} aria-label="Settings" />

// Icon after text
<Button iconPosition="after" icon={<ChevronRightIcon />}>Next</Button>
```

### Implementation

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 4px;
  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: var(--transition-colors);
  border: none;
}

.btn--icon-only {
  padding: 8px;
  aspect-ratio: 1;
}
```

---

## Input

Text input field for user data entry.

### Anatomy

- Container (border, background)
- Label (above or floating)
- Input field
- Helper text (below)
- Leading/trailing icons (optional)

### States

| State | Background | Border | Label Color |
|-------|------------|--------|-------------|
| Default | #1A1326 | 1px #553695 | #AF86F5 |
| Hover | #2B1D44 | 1px #8251EE | #AF86F5 |
| Focus | #2B1D44 | 2px #8251EE | #8251EE |
| Filled | #1A1326 | 1px #553695 | #AF86F5 |
| Error | #1A1326 | 2px #D32F2F | #D32F2F |
| Disabled | #0D0A10 | 1px #38255E | #553695 |

### Implementation

```css
.input-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-label {
  font-size: 12px;
  font-weight: 600;
  color: #AF86F5;
}

.input-field {
  height: 36px;
  padding: 0 12px;
  background: #1A1326;
  border: 1px solid #553695;
  border-radius: 4px;
  color: #E1CEFC;
  font-size: 14px;
  transition: var(--transition-colors);
}

.input-field:hover {
  background: #2B1D44;
  border-color: #8251EE;
}

.input-field:focus {
  outline: none;
  border-color: #8251EE;
  border-width: 2px;
}

.input-field::placeholder {
  color: #BC98F7;
}
```

---

## Tabs

Navigation between related content sections.

### Anatomy

- Tab list (container)
- Tab items (clickable)
- Tab panels (content)
- Active indicator (underline)

### Styles

| Style | Active Indicator | Usage |
|-------|------------------|-------|
| Underline | 2px bottom border | Primary navigation |
| Pill | Background fill | Compact sections |

### Implementation

```css
.tab-list {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #2B1D44;
}

.tab-item {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #AF86F5;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  transition: var(--transition-colors);
}

.tab-item:hover {
  color: #E1CEFC;
}

.tab-item[aria-selected="true"] {
  color: #E1CEFC;
  font-weight: 600;
}

.tab-item[aria-selected="true"]::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #8251EE;
}
```

---

## DataGrid

Table component for displaying and managing data.

### Anatomy

- Toolbar (search, filters, actions)
- Column headers (sortable)
- Data rows (selectable)
- Pagination
- Optional: Selection column, row actions

### Column Header

```css
.datagrid-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #1A1326;
  font-size: 12px;
  font-weight: 600;
  color: #AF86F5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.datagrid-header--sortable {
  cursor: pointer;
}

.datagrid-header--sorted .sort-icon {
  color: #8251EE;
}
```

### Data Row

```css
.datagrid-row {
  display: flex;
  align-items: center;
  padding: 0;
  background: #030206;
  border-bottom: 1px solid #1A1326;
  transition: var(--transition-colors);
}

.datagrid-row:hover {
  background: #1A1326;
}

.datagrid-row--selected {
  background: #2B1D44;
}

.datagrid-cell {
  padding: 12px 16px;
  font-size: 14px;
  color: #E1CEFC;
}

.datagrid-cell--link {
  color: #6BB3FF;
  cursor: pointer;
}

.datagrid-cell--link:hover {
  text-decoration: underline;
}
```

### Selection

```css
.datagrid-checkbox {
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selection-indicator {
  width: 4px;
  height: 100%;
  background: #8251EE;
  position: absolute;
  left: 0;
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.datagrid-row--selected .selection-indicator {
  opacity: 1;
}
```

### Pagination

```css
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 14px;
  color: #AF86F5;
}

.pagination-info {
  /* "1-10 of 100" */
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: transparent;
  color: #AF86F5;
  cursor: pointer;
}

.pagination-btn:hover {
  background: #2B1D44;
  color: #E1CEFC;
}

.pagination-btn--active {
  background: #8251EE;
  color: #FFFFFF;
}
```

---

## Panel

Side panel for entity details, forms, or secondary content.

### Anatomy

- Header (title, close button)
- Content area (scrollable)
- Footer (optional, actions)

### Implementation

```css
.panel {
  width: 400px;
  height: 100%;
  background: #1A1326;
  border-left: 1px solid #2B1D44;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #2B1D44;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #E1CEFC;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.panel-footer {
  padding: 16px;
  border-top: 1px solid #2B1D44;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
```

---

## Slider

Range input for numeric values.

### Implementation

```css
.slider {
  width: 100%;
  height: 4px;
  background: #2B1D44;
  border-radius: 2px;
  position: relative;
}

.slider-track {
  height: 100%;
  background: #E91E8C;
  border-radius: 2px;
}

.slider-thumb {
  width: 16px;
  height: 16px;
  background: #FFFFFF;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.slider-value {
  font-size: 12px;
  color: #E1CEFC;
  margin-left: 8px;
}
```

---

## Toggle

Boolean on/off switch.

### States

| State | Track | Thumb |
|-------|-------|-------|
| Off | #38255E | #888888 |
| On | #8251EE | #FFFFFF |
| Disabled Off | #2B1D44 | #553695 |
| Disabled On | #643FB2 | #AF86F5 |

### Implementation

```css
.toggle {
  width: 40px;
  height: 20px;
  background: #38255E;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: var(--transition-colors);
}

.toggle--checked {
  background: #8251EE;
}

.toggle-thumb {
  width: 16px;
  height: 16px;
  background: #888888;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: var(--transition-transform);
}

.toggle--checked .toggle-thumb {
  background: #FFFFFF;
  transform: translateX(20px);
}
```
