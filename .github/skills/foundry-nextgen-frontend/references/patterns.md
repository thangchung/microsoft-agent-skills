# Microsoft Foundry NextGen UI Patterns

Elegant layout patterns and page structures for Microsoft Foundry interfaces.

## Table of Contents

1. [Page Layout Structure](#page-layout-structure)
2. [Entity List Pattern](#entity-list-pattern)
3. [Agent Builder Pattern](#agent-builder-pattern)
4. [Dashboard Pattern](#dashboard-pattern)
5. [Detail Panel Pattern](#detail-panel-pattern)
6. [Navigation Patterns](#navigation-patterns)
7. [Elegance Guidelines](#elegance-guidelines)

---

## Page Layout Structure

### Standard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header (64px)                                               │
│ ┌─────────┬───────────────────────────────────────────────┐ │
│ │ Logo    │ Search (⌘K)        Nav Items        User Menu │ │
│ └─────────┴───────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────────────────────────────────┬─────────┐ │
│ │         │                                     │         │ │
│ │ Sidebar │           Main Content              │ Panel   │ │
│ │ (64px)  │           (flex-1)                  │(400px)  │ │
│ │         │                                     │         │ │
│ │         │                                     │         │ │
│ └─────────┴─────────────────────────────────────┴─────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### CSS Structure

```css
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #030206;
}

.app-header {
  height: 64px;
  background: #1A1326;
  border-bottom: 1px solid #2B1D44;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-sidebar {
  width: 64px;
  background: #1A1326;
  border-right: 1px solid #2B1D44;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.app-panel {
  width: 400px;
  background: #1A1326;
  border-left: 1px solid #2B1D44;
  overflow-y: auto;
}
```

---

## Entity List Pattern

For displaying collections (deployments, agents, models, endpoints).

### Structure

```
┌─────────────────────────────────────────────────┬───────────┐
│ Title (100)                     [Button][Button]│           │
├─────────────────────────────────────────────────┤           │
│ First tab | Second tab | Third tab              │  entity-2 │
├─────────────────────────────────────────────────┤  Complete │
│ [🔍 Search                    ] [Create new ▾]  │           │
├─────────────────────────────────────────────────┤  Build:   │
│ ○  Name ↓    Description    Created on         │  6/26/25  │
├─────────────────────────────────────────────────┤           │
│ ○  Link      Lorem ipsum    Cell text          │  [Btn][Btn]│
│ ●  Link      Lorem ipsum    Cell text          │           │
│ ○  Link      Lorem ipsum    Cell text          │  Endpoint │
│ ○  Link      Lorem ipsum    Cell text          │  [-------]│
│ ...                                             │           │
├─────────────────────────────────────────────────┤  ┌───────┐│
│ 1-10 of 100           ◀ 1  2  3 ▶              │  │ Chart ││
└─────────────────────────────────────────────────┴──┴───────┴┘
```

### Implementation

```tsx
function EntityListPage() {
  return (
    <div className="entity-list-page">
      <header className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">Entity list (100)</h1>
        </div>
        <div className="page-header__right">
          <Button appearance="secondary">Button</Button>
          <Button appearance="primary">Button</Button>
        </div>
      </header>

      <Tabs defaultValue="first">
        <TabList>
          <Tab value="first">First tab</Tab>
          <Tab value="second">Second tab</Tab>
          <Tab value="third">Third tab</Tab>
        </TabList>
      </Tabs>

      <div className="toolbar">
        <SearchInput placeholder="Search" />
        <Button appearance="primary" icon={<AddIcon />}>
          Create new
        </Button>
      </div>

      <DataGrid
        columns={columns}
        data={entities}
        selectable
        sortable
        pagination={{ pageSize: 10, total: 100 }}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
```

### Key Elements

1. **Page Header**: Title with count, action buttons right-aligned
2. **Tabs**: Filter by category/status
3. **Toolbar**: Search left, primary action right (magenta CTA)
4. **DataGrid**: Selection column, sortable headers, link cells
5. **Detail Panel**: Opens on row selection

---

## Agent Builder Pattern

For configuring AI agents with chat preview.

### Structure

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 Sales prep agent                         [Button][Button]│
├─────────────────────────────────────────────────────────────┤
│ Build | Threads | Monitor | API Docs                        │
├───────────────────────────────┬─────────────────────────────┤
│ [gpt-4.1          ▾] [⚙️]    │  Chat | Code                 │
├───────────────────────────────┤─────────────────────────────┤
│ ▼ Instructions                │                             │
│ ┌───────────────────────────┐ │                             │
│ │ Placeholder text          │ │    👤 Hi, how can I help   │
│ │                           │ │       you?                  │
│ └───────────────────────────┘ │                             │
│ [Generate]                    │                             │
├───────────────────────────────┤                             │
│ ▼ Tools ⓘ                    │                             │
│                               │                             │
│ 📄 File search        [Files]│                             │
│    ┌─ Vector store • 20mb    │                             │
│    └─ vs_681...ef15     🔄   │                             │
│                               │                             │
│ </> Code interpreter  [Files]│  ┌───────────────────────┐  │
│    📄 filename-128...thing 🗑│  │ Chat with the agent...│  │
│    📄 filename-128...thing 🗑│  └───────────────────────┘  │
│    📄 filename-128...thing 🗑│                        📎 ➤  │
├───────────────────────────────┼─────────────────────────────┤
│ 💾 Save          🗑 Delete    │ AI-generated content may... │
└───────────────────────────────┴─────────────────────────────┘
```

### Implementation

```css
.agent-builder {
  display: grid;
  grid-template-columns: 380px 1fr;
  grid-template-rows: auto 1fr auto;
  height: 100%;
}

.agent-builder__sidebar {
  grid-row: 1 / -1;
  background: #030206;
  border-right: 1px solid #2B1D44;
  display: flex;
  flex-direction: column;
}

.agent-builder__preview {
  display: flex;
  flex-direction: column;
  background: #1A1326;
}

.config-section {
  padding: 16px;
  border-bottom: 1px solid #2B1D44;
}

.config-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  color: #E1CEFC;
  margin-bottom: 12px;
}

.config-section__content {
  padding-left: 8px;
}

.chat-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px;
}

.chat-message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.chat-message--bot {
  background: #2B1D44;
  align-self: flex-start;
}

.chat-message--user {
  background: #8251EE;
  align-self: flex-end;
}
```

---

## Dashboard Pattern

For overview pages with metrics and charts.

### Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard                                           [Export]│
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐│
│ │ Metric 1    │ │ Metric 2    │ │ Metric 3    │ │ Metric 4 ││
│ │ 1,234       │ │ $56.7K      │ │ 89%         │ │ 12.3ms   ││
│ │ ↑ 12%       │ │ ↓ 3%        │ │ → 0%        │ │ ↑ 5%     ││
│ └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘│
├───────────────────────────────────┬─────────────────────────┤
│ ┌───────────────────────────────┐ │ ┌─────────────────────┐ │
│ │                               │ │ │                     │ │
│ │         Line Chart            │ │ │    Pie Chart        │ │
│ │                               │ │ │                     │ │
│ └───────────────────────────────┘ │ └─────────────────────┘ │
├───────────────────────────────────┴─────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │                     Bar Chart                           │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Metric Card

```css
.metric-card {
  background: #1A1326;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-card__label {
  font-size: 12px;
  font-weight: 500;
  color: #AF86F5;
}

.metric-card__value {
  font-size: 28px;
  font-weight: 600;
  color: #E1CEFC;
}

.metric-card__trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-card__trend--up {
  color: #4ADE80;
}

.metric-card__trend--down {
  color: #F87171;
}
```

### Chart Container

```css
.chart-container {
  background: #1A1326;
  border-radius: 8px;
  padding: 20px;
}

.chart-container__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-container__title {
  font-size: 14px;
  font-weight: 600;
  color: #E1CEFC;
}

/* Chart colors */
.chart-color-primary: #8251EE;
.chart-color-secondary: #E91E8C;
.chart-color-tertiary: #6BB3FF;
.chart-color-quaternary: #4ADE80;
.chart-color-quinary: #F7931E;
```

---

## Detail Panel Pattern

Side panel for viewing/editing entity details.

### Structure

```
┌─────────────────────────────────────┐
│ entity-2           Complete   ✎ ⋯  │
│ Build: 6/26/25, 12:29:44 PM        │
├─────────────────────────────────────┤
│ [Button] [Button]                   │
│                                     │
│ Endpoint                            │
│ ┌─────────────────────────────┐ 📋 │
│ │ endpoint-aip-2i93nimldpaeim │     │
│ └─────────────────────────────┘     │
│                                     │
│ API Key                             │
│ ┌─────────────────────────────┐ 📋 │
│ │ ●●●●●●●●●●●●●●●●●●●●●●●●●●● │     │
│ └─────────────────────────────┘     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Total spend                     │ │
│ │         ┌───┐                   │ │
│ │ 12k     │   │                   │ │
│ │ 10k     │   │ ┌───┐             │ │
│ │ 8k      │   │ │   │ ┌───┐      │ │
│ │ 6k  ┌───┤   │ │   │ │   │      │ │
│ │     │   │   │ │   │ │   │      │ │
│ │     └───┴───┴─┴───┴─┴───┴───── │ │
│ │     Jan Feb Mar Apr May Jun    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Implementation

```css
.detail-panel {
  width: 400px;
  background: #1A1326;
  border-left: 1px solid #2B1D44;
  display: flex;
  flex-direction: column;
}

.detail-panel__header {
  padding: 16px;
  border-bottom: 1px solid #2B1D44;
}

.detail-panel__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.detail-panel__title {
  font-size: 16px;
  font-weight: 600;
  color: #E1CEFC;
}

.detail-panel__meta {
  font-size: 12px;
  color: #AF86F5;
}

.detail-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.detail-field {
  margin-bottom: 16px;
}

.detail-field__label {
  font-size: 12px;
  font-weight: 500;
  color: #AF86F5;
  margin-bottom: 4px;
}

.detail-field__value {
  background: #030206;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  color: #E1CEFC;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-field__copy {
  color: #AF86F5;
  cursor: pointer;
}

.detail-field__copy:hover {
  color: #E1CEFC;
}
```

---

## Navigation Patterns

### Icon Sidebar

```css
.icon-sidebar {
  width: 64px;
  background: #1A1326;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.sidebar-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #AF86F5;
  cursor: pointer;
  transition: var(--transition-colors);
}

.sidebar-icon:hover {
  background: #2B1D44;
  color: #E1CEFC;
}

.sidebar-icon--active {
  background: #8251EE;
  color: #FFFFFF;
}
```

### Header Navigation

```css
.header-nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-nav__item {
  font-size: 14px;
  font-weight: 500;
  color: #AF86F5;
  cursor: pointer;
  transition: var(--transition-colors);
}

.header-nav__item:hover {
  color: #E1CEFC;
}

.header-nav__item--active {
  color: #E1CEFC;
}
```

### Breadcrumb

```css
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb__item {
  color: #AF86F5;
}

.breadcrumb__item--link {
  cursor: pointer;
}

.breadcrumb__item--link:hover {
  color: #E1CEFC;
  text-decoration: underline;
}

.breadcrumb__item--current {
  color: #E1CEFC;
  font-weight: 500;
}

.breadcrumb__separator {
  color: #553695;
}
```

---

## Elegance Guidelines

### Visual Hierarchy Through Restraint

```css
/* Use typography weight, not color, for hierarchy */
.title-primary {
  font-size: 20px;
  font-weight: 600;
  color: #E1CEFC;
  letter-spacing: -0.01em;
}

.title-secondary {
  font-size: 14px;
  font-weight: 400;
  color: #AF86F5;
}

/* Subtle, not shouty */
.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #2B1D44, transparent);
  margin: 24px 0;
}
```

### Micro-interactions

```css
/* Refined hover states */
.interactive-card {
  background: #1A1326;
  transition: background 200ms ease, transform 200ms ease;
}

.interactive-card:hover {
  background: #2B1D44;
  transform: translateY(-1px);
}

/* Subtle focus rings */
.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #030206, 0 0 0 4px #8251EE;
}
```

### Spacing Rhythm

Maintain consistent spacing multiples for visual harmony:

```css
/* 8px base unit */
--space-1: 4px;   /* Half */
--space-2: 8px;   /* Base */
--space-3: 12px;  /* 1.5x */
--space-4: 16px;  /* 2x */
--space-6: 24px;  /* 3x */
--space-8: 32px;  /* 4x */
--space-12: 48px; /* 6x */
```

### Loading States

```css
/* Elegant skeleton shimmer */
.skeleton {
  background: linear-gradient(
    90deg,
    #1A1326 25%,
    #2B1D44 50%,
    #1A1326 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Empty States

```tsx
function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-foundry-elevated flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foundry-text mb-2">{title}</h3>
      <p className="text-sm text-foundry-text-muted max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
```

### Logo Usage

**Dark backgrounds**: Use `assets/foundry-logo-dark.png` - the 3D metallic purple mark with ambient glow

**Light backgrounds**: Use `assets/foundry-logo-light.png` - the dotted/halftone monochrome mark

```tsx
// Header logo component
function FoundryLogo({ variant = 'dark' }) {
  return (
    <img 
      src={variant === 'dark' ? '/foundry-logo-dark.png' : '/foundry-logo-light.png'}
      alt="Microsoft Foundry"
      className="h-8 w-auto"
    />
  );
}
```
