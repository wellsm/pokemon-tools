# Pokemon Tools — Remodel V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand `pokedex-tcg` → `pokemon-tools` and execute the visual + structural remodel: stack-navigation shell, regional Pokédex binders, and Battle Assistant with persistence + adapted history. Preserves existing battle logic; refactors UI and routing.

**Architecture:** "Layered" approach (option 1 from the spec). Foundation first (tokens, shell, data layer, stores), then features (Binder, Play), then cleanup. Every UI piece consumes M3 tokens defined in `DESIGN.md`. Existing game-store and binder math are **ported** (not rewritten) — preserve battle features that work today, only extend types where the spec adds new concepts (opponent name, prize counter, action summaries).

**Tech Stack:** React 18 + Vite + TypeScript, React Router v6, Zustand v5 (persist), Tailwind v4 with shadcn primitives, Radix UI + vaul drawers, lucide-react icons, Inter font (replacing Geist). Vitest + Testing Library + jsdom for unit tests.

**Reference docs:**
- Spec: `docs/superpowers/specs/2026-04-27-pokemon-tools-remodel-design.md`
- Visual tokens: `DESIGN.md` (frontmatter is source of truth)
- Future tools (out of scope): `docs/ideas/future-tools.md`
- Prototype mockups: `prototypes/{index,binder-list,create-binder,card-options,history-log}.png`

**Note on existing code:** Read the affected file first before any "modify" task. The current code (especially `src/game-store.ts`, `src/components/app/game-table.tsx`, `src/components/app/slot-popover.tsx`, `src/components/app/coin-modal.tsx`) is the source of truth for behavior; classes change, **logic stays**.

---

## File Structure (target end state)

```
src/
├── main.tsx                         (modify)
├── App.tsx                          (rewrite: new routes, remove TabBar)
├── index.css                        (rewrite: M3 tokens replace shadcn defaults)
│
├── components/
│   ├── ui/                          (keep existing shadcn primitives)
│   ├── layout/
│   │   └── header.tsx               (new)
│   ├── shared/
│   │   ├── tactical-card.tsx        (new)
│   │   ├── status-panel.tsx         (new)
│   │   └── status-chip.tsx          (new)
│   ├── binder/
│   │   ├── folder-card.tsx          (move from app/, restyle)
│   │   ├── create-modal.tsx         (move from app/, restyle, swap "free"→region picker)
│   │   ├── edit-folder-drawer.tsx   (move from app/, restyle)
│   │   ├── binder-slot.tsx          (new — replaces parts of pokemon-card.tsx)
│   │   └── binder-paginator.tsx     (move from app/binder-page.tsx, restyle)
│   └── play/
│       ├── game-table.tsx           (move, restyle)
│       ├── field-side.tsx           (move, restyle)
│       ├── board-slot.tsx           (move, restyle)
│       ├── slot-popover.tsx         (move, restyle to card-options.png)
│       ├── coin-modal.tsx           (move, restyle)
│       ├── energy-badge.tsx         (move, restyle)
│       ├── energy-indicator.tsx     (move, restyle)
│       ├── game-history.tsx         (move, restyle to history-log.png)
│       ├── game-setup.tsx           (move, restyle)
│       ├── play-landing-card.tsx    (new)
│       └── match-settings-drawer.tsx (new)
│
├── pages/
│   ├── index.tsx                    (new — replaces home.tsx)
│   ├── binder-list.tsx              (new — replaces home/binder list portion)
│   ├── binder-detail.tsx            (new — replaces binder.tsx)
│   ├── play-landing.tsx             (new)
│   ├── play-setup.tsx               (new — extracted from play.tsx)
│   ├── play-match.tsx               (new — extracted from play.tsx)
│   └── settings.tsx                 (rewrite for new scope)
│
├── stores/
│   ├── binder-store.ts              (port from src/store.ts, new persist key)
│   ├── match-store.ts               (port from src/game-store.ts, new persist key)
│   └── settings-store.ts            (port from src/settings-store.ts, new persist key)
│
├── lib/
│   ├── pokemon.ts                   (consolidate from pokemon-data.ts + new region helpers)
│   ├── binder-math.ts               (rename from binder.ts; same logic)
│   └── utils.ts                     (keep)
│
└── data/
    └── pokemon.json                 (keep as source of truth)
```

**Files DELETED at end:**
- `src/store.ts` (after port to stores/binder-store.ts)
- `src/game-store.ts` (after port to stores/match-store.ts)
- `src/settings-store.ts` (after port to stores/settings-store.ts)
- `src/pokemon-data.ts` (after consolidate to lib/pokemon.ts)
- `src/lib/binder.ts` (after rename to binder-math.ts)
- `src/components/app/tab-bar.tsx`
- `src/components/app/search-bar.tsx`
- `src/components/app/search-modal.tsx`
- `src/components/app/search-drawer.tsx`
- `src/components/app/pokemon-card.tsx` (replaced by `binder/binder-slot.tsx`)
- `src/components/app/binder-page.tsx` (replaced by `binder/binder-paginator.tsx`)
- `src/components/app/silhouette-canvas.tsx` is **kept and moved** into `binder/` (used as fallback)
- `src/pages/home.tsx` (replaced by index.tsx + binder-list.tsx)
- `src/pages/binder.tsx` (replaced by binder-detail.tsx)
- `src/pages/play.tsx` (split into play-landing/setup/match.tsx)
- `src/components/app/` directory itself (after all migrations)

---

## Phase 0 — Setup & Dependencies

### Task 1: Rename package and install new dependencies

**Files:**
- Modify: `package.json`
- Modify: `index.html:7` (title)

- [ ] **Step 1: Update package.json name and dependencies**

Open `package.json` and apply these changes:
- Change `"name": "pokedex-tcg"` to `"name": "pokemon-tools"`.
- In `dependencies`, replace `"@fontsource-variable/geist": "^5.2.8"` with `"@fontsource-variable/inter": "^5.2.8"`.
- In `devDependencies`, add:
  ```json
  "vitest": "^2.1.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.5.0",
  "jsdom": "^25.0.0"
  ```
- In `scripts`, add:
  ```json
  "test": "vitest",
  "test:ci": "vitest run"
  ```

- [ ] **Step 2: Update index.html title**

In `index.html` line 7, change `<title>Pokédex TCG</title>` to `<title>Pokemon Tools</title>`.

- [ ] **Step 3: Install dependencies**

Run: `npm install`
Expected: completes with no errors; `node_modules/@fontsource-variable/inter` exists.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json index.html
git commit -m "chore: rebrand to pokemon-tools and add vitest stack"
```

---

### Task 2: Configure Vitest in vite.config.ts

**Files:**
- Modify: `vite.config.ts`
- Create: `src/setup-tests.ts`

- [ ] **Step 1: Add vitest config to vite.config.ts**

Replace the entire `vite.config.ts` with:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setup-tests.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
```

(Also fixes the previous hardcoded absolute alias path.)

- [ ] **Step 2: Create test setup file**

Create `src/setup-tests.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Smoke-test vitest**

Create a temporary `src/__smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('vitest smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

Run: `npm test -- --run`
Expected: 1 test passes.

- [ ] **Step 4: Delete the smoke test**

```bash
rm src/__smoke.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts src/setup-tests.ts
git commit -m "chore: configure vitest with jsdom and testing-library"
```

---

### Task 3: Apply M3 tokens to index.css and switch font to Inter

**Files:**
- Modify: `src/index.css` (full rewrite)
- Modify: `src/main.tsx` (font import — done in this task; route changes in Phase 4)

- [ ] **Step 1: Rewrite src/index.css with DESIGN.md tokens**

Replace the entire `src/index.css` with:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/inter";

@custom-variant dark (&:is(.dark *));

@theme {
  --font-sans: 'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-heading: var(--font-sans);
}

@theme inline {
  /* Material 3 surface tokens (DESIGN.md frontmatter — source of truth) */
  --color-background: var(--background);
  --color-on-background: var(--on-background);
  --color-surface: var(--surface);
  --color-surface-dim: var(--surface-dim);
  --color-surface-bright: var(--surface-bright);
  --color-surface-container-lowest: var(--surface-container-lowest);
  --color-surface-container-low: var(--surface-container-low);
  --color-surface-container: var(--surface-container);
  --color-surface-container-high: var(--surface-container-high);
  --color-surface-container-highest: var(--surface-container-highest);
  --color-on-surface: var(--on-surface);
  --color-on-surface-variant: var(--on-surface-variant);
  --color-outline: var(--outline);
  --color-outline-variant: var(--outline-variant);
  --color-primary: var(--primary);
  --color-on-primary: var(--on-primary);
  --color-primary-container: var(--primary-container);
  --color-on-primary-container: var(--on-primary-container);
  --color-secondary: var(--secondary);
  --color-on-secondary: var(--on-secondary);
  --color-secondary-container: var(--secondary-container);
  --color-on-secondary-container: var(--on-secondary-container);
  --color-tertiary: var(--tertiary);
  --color-on-tertiary: var(--on-tertiary);
  --color-error: var(--error);
  --color-on-error: var(--on-error);
  --color-error-container: var(--error-container);
  --color-on-error-container: var(--on-error-container);

  /* shadcn-compatible aliases (so existing primitives keep working) */
  --color-foreground: var(--on-surface);
  --color-card: var(--surface-container);
  --color-card-foreground: var(--on-surface);
  --color-popover: var(--surface-container-high);
  --color-popover-foreground: var(--on-surface);
  --color-primary-foreground: var(--on-primary);
  --color-secondary-foreground: var(--on-secondary);
  --color-muted: var(--surface-container-low);
  --color-muted-foreground: var(--on-surface-variant);
  --color-accent: var(--surface-container-high);
  --color-accent-foreground: var(--on-surface);
  --color-destructive: var(--error);
  --color-border: var(--outline-variant);
  --color-input: var(--surface-container);
  --color-ring: var(--primary-container);

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
}

:root, .dark {
  /* M3 tokens from DESIGN.md frontmatter */
  --background: #111318;
  --on-background: #e2e2e8;
  --surface: #111318;
  --surface-dim: #111318;
  --surface-bright: #37393e;
  --surface-container-lowest: #0c0e12;
  --surface-container-low: #1a1c20;
  --surface-container: #1e2024;
  --surface-container-high: #282a2e;
  --surface-container-highest: #333539;
  --on-surface: #e2e2e8;
  --on-surface-variant: #ebbbb4;
  --outline: #b18780;
  --outline-variant: #603e39;
  --primary: #ffb4a8;
  --on-primary: #690100;
  --primary-container: #ff5540;
  --on-primary-container: #5c0000;
  --secondary: #bdf4ff;
  --on-secondary: #00363d;
  --secondary-container: #00e3fd;
  --on-secondary-container: #00616d;
  --tertiary: #c7c6c6;
  --on-tertiary: #303031;
  --error: #ffb4ab;
  --on-error: #690005;
  --error-container: #93000a;
  --on-error-container: #ffdad6;
}

@layer base {
  html, body {
    background: var(--background);
    color: var(--on-surface);
  }
  html {
    @apply font-sans;
  }
  /* Force dark theme for V1 (Dark Mode First per DESIGN.md) */
  html { color-scheme: dark; }
}

/* keep existing animations */
@keyframes card-highlight {
  0%, 100% { box-shadow: 0 0 0 2px var(--primary), 0 0 8px 3px rgba(255, 85, 64, 0.35); }
  50%      { box-shadow: 0 0 0 4px var(--primary-container), 0 0 18px 5px rgba(255, 85, 64, 0.55); }
}
.card-highlighted {
  animation: card-highlight 0.85s ease-in-out infinite;
  border-color: var(--primary) !important;
}

@keyframes coin-flip {
  0%   { transform: rotateY(0deg)    translateY(0); }
  30%  { transform: rotateY(540deg)  translateY(-30px); }
  70%  { transform: rotateY(1080deg) translateY(-10px); }
  100% { transform: rotateY(1440deg) translateY(0); }
}
.coin-flipping { animation: coin-flip 1s ease-in-out; }
```

- [ ] **Step 2: Remove the old settings-store hydrate block from main.tsx**

Open `src/main.tsx`. Replace the whole file with:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

(Removes Geist hydrate; settings store hydration is no longer needed for theme since V1 is dark-only.)

- [ ] **Step 3: Type-check and dev-server smoke**

Run: `npm run typecheck`
Expected: passes (no TS errors).

Run: `npm run dev`
Open browser at the printed URL.
Expected: page loads (will look broken — that's fine, just confirm no JS console errors and the body bg is `#111318`).
Stop dev server with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/main.tsx
git commit -m "feat: apply M3 dark tokens and switch font to Inter"
```

---

## Phase 1 — Data layer (TDD)

### Task 4: Create lib/pokemon.ts with REGIONS and helpers

**Files:**
- Create: `src/lib/pokemon.ts`
- Create: `src/lib/pokemon.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/pokemon.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  REGIONS, getPokemonByRegion, getPokemon, getSpriteUrl,
  type RegionKey,
} from './pokemon'

describe('REGIONS', () => {
  it('includes national + 9 regional entries', () => {
    expect(REGIONS).toHaveLength(10)
    const keys = REGIONS.map((r) => r.key)
    expect(keys).toEqual([
      'national','kanto','johto','hoenn','sinnoh',
      'unova','kalos','alola','galar','paldea',
    ])
  })
})

describe('getPokemonByRegion', () => {
  it.each<[RegionKey, number]>([
    ['kanto', 151],
    ['johto', 100],
    ['hoenn', 135],
    ['sinnoh', 107],
    ['unova', 156],
    ['kalos', 72],
    ['alola', 88],
    ['galar', 96],
    ['paldea', 120],
    ['national', 1025],
  ])('returns %s with %i entries', (region, count) => {
    expect(getPokemonByRegion(region)).toHaveLength(count)
  })

  it('kanto entries have ids 1..151 in order', () => {
    const kanto = getPokemonByRegion('kanto')
    expect(kanto[0].id).toBe(1)
    expect(kanto[150].id).toBe(151)
  })

  it('johto entries have ids 152..251', () => {
    const johto = getPokemonByRegion('johto')
    expect(johto[0].id).toBe(152)
    expect(johto.at(-1)!.id).toBe(251)
  })
})

describe('getPokemon', () => {
  it('returns Bulbasaur for id 1', () => {
    expect(getPokemon(1)?.name).toBe('Bulbasaur')
  })
  it('returns Pikachu for id 25', () => {
    expect(getPokemon(25)?.name).toBe('Pikachu')
  })
  it('returns undefined for unknown id', () => {
    expect(getPokemon(99999)).toBeUndefined()
  })
})

describe('getSpriteUrl', () => {
  it('builds official artwork URL by default', () => {
    expect(getSpriteUrl(1)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'
    )
  })
  it('builds sprite URL when requested', () => {
    expect(getSpriteUrl(25, 'sprite')).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/pokemon.test.ts`
Expected: FAIL with "Cannot find module './pokemon'".

- [ ] **Step 3: Implement lib/pokemon.ts**

Create `src/lib/pokemon.ts`:

```ts
import rawData from '@/data/pokemon.json'

export type Pokemon = {
  id: number
  name: string
  types: string[]
  generation: number
}

export const ALL_POKEMON: Pokemon[] = rawData as Pokemon[]

export const REGIONS = [
  { key: 'national', label: 'National', generations: [1,2,3,4,5,6,7,8,9] },
  { key: 'kanto',    label: 'Kanto',    generations: [1] },
  { key: 'johto',    label: 'Johto',    generations: [2] },
  { key: 'hoenn',    label: 'Hoenn',    generations: [3] },
  { key: 'sinnoh',   label: 'Sinnoh',   generations: [4] },
  { key: 'unova',    label: 'Unova',    generations: [5] },
  { key: 'kalos',    label: 'Kalos',    generations: [6] },
  { key: 'alola',    label: 'Alola',    generations: [7] },
  { key: 'galar',    label: 'Galar',    generations: [8] },
  { key: 'paldea',   label: 'Paldea',   generations: [9] },
] as const

export type RegionKey = typeof REGIONS[number]['key']

const byId = new Map<number, Pokemon>(ALL_POKEMON.map((p) => [p.id, p]))
const byName = new Map<string, Pokemon>(
  ALL_POKEMON.map((p) => [p.name.toLowerCase(), p])
)

export function getPokemonByRegion(region: RegionKey): Pokemon[] {
  const r = REGIONS.find((x) => x.key === region)!
  const set = new Set<number>(r.generations)
  return ALL_POKEMON.filter((p) => set.has(p.generation))
}

export function getPokemon(id: number): Pokemon | undefined {
  return byId.get(id)
}

export function getPokemonByName(name: string): Pokemon | undefined {
  return byName.get(name.toLowerCase())
}

export function getSpriteUrl(id: number, kind: 'official' | 'sprite' = 'official'): string {
  if (kind === 'official') {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

/* shared color map (kept from old pokemon-data.ts) */
export const TYPE_COLOR: Record<string, string> = {
  Fire: '#FF6B35', Water: '#4FC3F7', Grass: '#66BB6A', Electric: '#FFCA28',
  Psychic: '#EC407A', Ice: '#80DEEA', Dragon: '#7E57C2', Dark: '#5D4037',
  Fairy: '#F48FB1', Fighting: '#EF5350', Poison: '#AB47BC', Ground: '#BCAAA4',
  Flying: '#90CAF9', Bug: '#9CCC65', Rock: '#8D6E63', Ghost: '#5C6BC0',
  Steel: '#B0BEC5', Normal: '#9E9E9E',
}

export function searchPokemon(query: string, region: RegionKey = 'national'): Pokemon[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const pool = getPokemonByRegion(region)
  const asNum = parseInt(q, 10)
  if (!Number.isNaN(asNum)) {
    const hit = pool.find((p) => p.id === asNum)
    return hit ? [hit] : []
  }
  const exact = pool.find((p) => p.name.toLowerCase() === q)
  if (exact) return [exact]
  return pool.filter((p) => p.name.toLowerCase().startsWith(q)).slice(0, 12)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/pokemon.test.ts`
Expected: all tests pass (4 describe blocks, ~17 assertions).

- [ ] **Step 5: Commit**

```bash
git add src/lib/pokemon.ts src/lib/pokemon.test.ts
git commit -m "feat(lib): add pokemon helpers with REGIONS and sprite URLs"
```

---

### Task 5: Rename binder.ts → binder-math.ts and add region-paginator test

**Files:**
- Rename: `src/lib/binder.ts` → `src/lib/binder-math.ts`
- Create: `src/lib/binder-math.test.ts`

- [ ] **Step 1: Rename the file**

```bash
git mv src/lib/binder.ts src/lib/binder-math.ts
```

- [ ] **Step 2: Write the test**

Create `src/lib/binder-math.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  parseFormat, calculatePosition, totalPages,
  pageCapacity, slotRangeForPage,
} from './binder-math'

describe('parseFormat', () => {
  it('parses 3x3', () => expect(parseFormat('3x3')).toEqual({ cols: 3, rows: 3 }))
  it('parses 4x3', () => expect(parseFormat('4x3')).toEqual({ cols: 4, rows: 3 }))
  it('throws on invalid format', () => expect(() => parseFormat('garbage')).toThrow())
})

describe('totalPages for Kanto (151) on 3x3', () => {
  it('is 17 pages (16 full + 1 with 7)', () => {
    expect(totalPages(151, { cols: 3, rows: 3, back: false })).toBe(17)
  })
})

describe('totalPages for National (1025) on 4x3', () => {
  it('is 86 pages', () => {
    expect(totalPages(1025, { cols: 4, rows: 3, back: false })).toBe(86)
  })
})

describe('calculatePosition is a round-trip with slotRangeForPage', () => {
  it('for slot 50 on 3x3 → page 6 row 2 col 2 → range 45..53 contains 49', () => {
    const config = { cols: 3, rows: 3, back: false }
    const pos = calculatePosition(50, config)
    expect(pos.page).toBe(6)
    const range = slotRangeForPage(pos.page, config)
    expect(50 - 1).toBeGreaterThanOrEqual(range.start)
    expect(50 - 1).toBeLessThanOrEqual(range.end)
  })
})

describe('pageCapacity', () => {
  it('3x3 = 9', () => expect(pageCapacity({ cols: 3, rows: 3, back: false })).toBe(9))
  it('4x3 = 12', () => expect(pageCapacity({ cols: 4, rows: 3, back: false })).toBe(12))
})
```

- [ ] **Step 3: Run test to verify it passes**

Run: `npm test -- --run src/lib/binder-math.test.ts`
Expected: all 7 tests pass.

(No code change needed — the existing `binder.ts` already implements correctly. The test guarantees future refactors don't break it.)

- [ ] **Step 4: Find and update all imports of the old path**

Run: `grep -rn "from '@/lib/binder'" src/ || true`
Run: `grep -rn 'from "@/lib/binder"' src/ || true`
Run: `grep -rn "from '\\./binder'" src/lib/ || true`

For every match, change `@/lib/binder` to `@/lib/binder-math` and `./binder` to `./binder-math`. Common candidates: `src/components/app/binder-page.tsx`, `src/pages/binder.tsx`. Apply with Edit tool.

- [ ] **Step 5: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 6: Commit**

```bash
git add src/lib/binder-math.ts src/lib/binder-math.test.ts
git add -u src/  # picks up moved/edited files
git commit -m "refactor(lib): rename binder.ts to binder-math.ts and add tests"
```

---

## Phase 2 — Stores (port + extend)

### Task 6: Port settings-store to stores/settings-store.ts

**Files:**
- Create: `src/stores/settings-store.ts`
- (Leave `src/settings-store.ts` for now; deletion in Phase 9.)

- [ ] **Step 1: Create the new settings store**

Create `src/stores/settings-store.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SettingsState = {
  /** placeholder for V1 — add settings here as needed */
  _v: 1
  clearAllData: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      _v: 1,
      clearAllData: () => {
        // Clear our v1 keys (other stores' actions will run alongside in pages/settings.tsx)
        localStorage.removeItem('pokemon-tools/binders/v1')
        localStorage.removeItem('pokemon-tools/match/v1')
        localStorage.removeItem('pokemon-tools/settings/v1')
        // Hard navigate to / for clean in-memory state
        window.location.assign('/')
      },
    }),
    {
      name: 'pokemon-tools/settings/v1',
      version: 1,
    }
  )
)
```

- [ ] **Step 2: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/stores/settings-store.ts
git commit -m "feat(stores): add settings-store under stores/ with clearAllData"
```

---

### Task 7: Port binder-store to stores/binder-store.ts (new shape: regional)

**Files:**
- Create: `src/stores/binder-store.ts`
- Create: `src/stores/binder-store.test.ts`

- [ ] **Step 1: Write the test**

Create `src/stores/binder-store.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useBinderStore } from './binder-store'

beforeEach(() => {
  // Reset persisted state between tests
  localStorage.clear()
  useBinderStore.setState({ binders: [] })
})

describe('binder-store', () => {
  it('createBinder returns a string id and adds an entry', () => {
    const id = useBinderStore.getState().createBinder({
      name: 'Pokédex – Kanto',
      region: 'kanto',
      grid: '3x3',
    })
    expect(typeof id).toBe('string')
    expect(useBinderStore.getState().binders).toHaveLength(1)
    expect(useBinderStore.getState().binders[0].id).toBe(id)
    expect(useBinderStore.getState().binders[0].ownedSlots).toEqual([])
  })

  it('toggleSlotOwned adds then removes a pokemon id', () => {
    const id = useBinderStore.getState().createBinder({
      name: 'X', region: 'kanto', grid: '3x3',
    })
    useBinderStore.getState().toggleSlotOwned(id, 25)
    expect(useBinderStore.getState().binders[0].ownedSlots).toContain(25)
    useBinderStore.getState().toggleSlotOwned(id, 25)
    expect(useBinderStore.getState().binders[0].ownedSlots).not.toContain(25)
  })

  it('setMain enforces single-main', () => {
    const a = useBinderStore.getState().createBinder({ name: 'A', region: 'kanto', grid: '3x3' })
    const b = useBinderStore.getState().createBinder({ name: 'B', region: 'johto', grid: '3x3' })
    useBinderStore.getState().setMain(a)
    expect(useBinderStore.getState().binders.find(x=>x.id===a)?.isMain).toBe(true)
    useBinderStore.getState().setMain(b)
    expect(useBinderStore.getState().binders.find(x=>x.id===a)?.isMain).toBe(false)
    expect(useBinderStore.getState().binders.find(x=>x.id===b)?.isMain).toBe(true)
  })

  it('renameBinder and setCover update fields', () => {
    const id = useBinderStore.getState().createBinder({ name: 'A', region: 'kanto', grid: '3x3' })
    useBinderStore.getState().renameBinder(id, 'Renamed')
    useBinderStore.getState().setCover(id, 6)
    const b = useBinderStore.getState().binders[0]
    expect(b.name).toBe('Renamed')
    expect(b.coverPokemonId).toBe(6)
  })

  it('deleteBinder removes the entry', () => {
    const id = useBinderStore.getState().createBinder({ name: 'A', region: 'kanto', grid: '3x3' })
    useBinderStore.getState().deleteBinder(id)
    expect(useBinderStore.getState().binders).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/stores/binder-store.test.ts`
Expected: FAIL with "Cannot find module './binder-store'".

- [ ] **Step 3: Implement the store**

Create `src/stores/binder-store.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { RegionKey } from '@/lib/pokemon'

export type BinderGrid = '3x3' | '4x3' | '2x2' | '4x4'

export type Binder = {
  id: string
  name: string
  region: RegionKey
  grid: BinderGrid
  coverPokemonId?: number
  isMain?: boolean
  ownedSlots: number[]      // pokemon IDs
  createdAt: number
  updatedAt: number
}

type CreateInput = Pick<Binder, 'name' | 'region' | 'grid'> &
  Partial<Pick<Binder, 'coverPokemonId' | 'isMain'>>

interface BinderStore {
  binders: Binder[]
  createBinder: (input: CreateInput) => string
  deleteBinder: (id: string) => void
  renameBinder: (id: string, name: string) => void
  setMain: (id: string) => void
  toggleSlotOwned: (id: string, pokemonId: number) => void
  setCover: (id: string, pokemonId: number | undefined) => void
}

const touch = (b: Binder): Binder => ({ ...b, updatedAt: Date.now() })

export const useBinderStore = create<BinderStore>()(
  persist(
    (set) => ({
      binders: [],

      createBinder: (input) => {
        const id = nanoid()
        const now = Date.now()
        set((s) => ({
          binders: [
            ...s.binders,
            { ...input, id, ownedSlots: [], createdAt: now, updatedAt: now },
          ],
        }))
        return id
      },

      deleteBinder: (id) =>
        set((s) => ({ binders: s.binders.filter((b) => b.id !== id) })),

      renameBinder: (id, name) =>
        set((s) => ({
          binders: s.binders.map((b) => (b.id === id ? touch({ ...b, name }) : b)),
        })),

      setMain: (id) =>
        set((s) => ({
          binders: s.binders.map((b) =>
            touch({ ...b, isMain: b.id === id })
          ),
        })),

      toggleSlotOwned: (id, pokemonId) =>
        set((s) => ({
          binders: s.binders.map((b) => {
            if (b.id !== id) return b
            const has = b.ownedSlots.includes(pokemonId)
            return touch({
              ...b,
              ownedSlots: has
                ? b.ownedSlots.filter((p) => p !== pokemonId)
                : [...b.ownedSlots, pokemonId],
            })
          }),
        })),

      setCover: (id, pokemonId) =>
        set((s) => ({
          binders: s.binders.map((b) =>
            b.id === id ? touch({ ...b, coverPokemonId: pokemonId }) : b
          ),
        })),
    }),
    {
      name: 'pokemon-tools/binders/v1',
      version: 1,
    }
  )
)

export function getBinderProgress(b: Binder, totalSlots: number) {
  return { owned: b.ownedSlots.length, total: totalSlots }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/stores/binder-store.test.ts`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/stores/binder-store.ts src/stores/binder-store.test.ts
git commit -m "feat(stores): add regional binder-store with persist v1 key"
```

---

### Task 8: Port game-store to stores/match-store.ts (extend with opponent + prize + summary)

**Files:**
- Create: `src/stores/match-store.ts`
- Create: `src/stores/match-store.test.ts`

This task **ports the existing game-store** (preserves all working battle logic). It only:
1. Renames the export to `useMatchStore` (alias `useGameStore` kept).
2. Changes the persist key to `pokemon-tools/match/v1`.
3. Adds three new top-level fields to the shape: `matchId`, `startedAt`, `opponentName`, and `prize: { a: number, b: number }`.
4. Adds a `summary` field on `GameAction`.
5. Provides a `startMatch({ opponentName? })` that supersedes the existing `startGame` (calls it under the hood + sets new fields). `endMatch` aliases `endGame` and clears new fields.

- [ ] **Step 1: Read the existing game-store thoroughly**

Run: `wc -l src/game-store.ts && wc -l src/game-data.ts`

Read the entire `src/game-store.ts` — you will copy it as the basis. Also read `src/game-data.ts` for the types it imports (we'll keep importing from there).

- [ ] **Step 2: Write the test**

Create `src/stores/match-store.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useMatchStore } from './match-store'

beforeEach(() => {
  localStorage.clear()
  useMatchStore.getState().endMatch()
})

describe('match-store', () => {
  it('startMatch sets matchId, startedAt, opponentName and activates', () => {
    useMatchStore.getState().startMatch({ opponentName: 'AshK123' })
    const s = useMatchStore.getState()
    expect(s.active).toBe(true)
    expect(s.opponentName).toBe('AshK123')
    expect(typeof s.matchId).toBe('string')
    expect(typeof s.startedAt).toBe('number')
    expect(s.prize).toEqual({ a: 6, b: 6 })
  })

  it('endMatch clears activation and identifying fields', () => {
    useMatchStore.getState().startMatch({})
    useMatchStore.getState().endMatch()
    const s = useMatchStore.getState()
    expect(s.active).toBe(false)
    expect(s.matchId).toBeNull()
    expect(s.opponentName).toBeUndefined()
  })

  it('logAction appends a history entry with summary', () => {
    useMatchStore.getState().startMatch({})
    useMatchStore.getState().logAction('a', 'damage', '+30 Damage')
    const h = useMatchStore.getState().history
    expect(h).toHaveLength(1)
    expect(h[0].summary).toBe('+30 Damage')
    expect(h[0].side).toBe('a')
  })

  it('takePrize decrements until 0', () => {
    useMatchStore.getState().startMatch({})
    useMatchStore.getState().takePrize('a')
    useMatchStore.getState().takePrize('a')
    expect(useMatchStore.getState().prize.a).toBe(4)
    for (let i = 0; i < 10; i++) useMatchStore.getState().takePrize('a')
    expect(useMatchStore.getState().prize.a).toBe(0)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- --run src/stores/match-store.test.ts`
Expected: FAIL with "Cannot find module './match-store'".

- [ ] **Step 4: Create stores/match-store.ts (port + extend)**

Create `src/stores/match-store.ts` with the **complete** content below. (This is `src/game-store.ts` rewritten — copy your existing logic and add the new fields/actions exactly as shown.)

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type {
  EnergyType, GameFormat, GameModules, BoardSlot, FieldSide,
  OrientationCondition,
} from '@/game-data'
import { FORMAT_DEFAULTS } from '@/game-data'

export type Side = 'a' | 'b'

export interface GameAction {
  id: string
  side: Side
  type: 'move' | 'damage' | 'energy' | 'slot' | 'turn' | 'coin' | 'prize'
  /** Plain-text rendered description for the timeline (e.g. "+180 Damage"). */
  summary: string
  /** Legacy alias kept for any old call sites. Same value as summary. */
  description: string
  timestamp: number
}

interface MatchState {
  /* identity */
  matchId: string | null
  startedAt: number | null
  opponentName?: string

  /* runtime (port from game-store) */
  format: GameFormat
  modules: GameModules
  energyPool: EnergyType[]
  active: boolean
  turn: number
  fieldA: FieldSide
  fieldB: FieldSide
  energyA: EnergyType | null
  energyB: EnergyType | null
  prize: { a: number; b: number }
  history: GameAction[]

  /* identity actions */
  startMatch: (input: { opponentName?: string }) => void
  endMatch: () => void

  /* runtime actions (port verbatim from game-store) */
  logAction: (side: Side, type: GameAction['type'], summary: string) => void
  setFormat: (format: GameFormat) => void
  setModules: (modules: GameModules) => void
  setEnergyPool: (pool: EnergyType[]) => void
  startGame: () => void
  endGame: () => void
  nextTurn: () => void
  generateEnergy: (side: Side) => void
  takePrize: (side: Side) => void

  addDamage: (side: Side, slotId: string, amount: number) => void
  clearDamage: (side: Side, slotId: string) => void
  attachEnergy: (side: Side, slotId: string, energy: EnergyType) => void
  removeEnergy: (side: Side, slotId: string, index: number) => void
  removeOneEnergy: (side: Side, slotId: string, energy: EnergyType) => void
  clearEnergies: (side: Side, slotId: string) => void
  addSlot: (side: Side) => void
  removeSlot: (side: Side, slotId: string) => void
  swapSlots: (side: Side, fromId: string, toId: string) => void
  setOrientation: (side: Side, slotId: string, condition: OrientationCondition) => void
  toggleMarker: (side: Side, slotId: string, marker: 'poisoned' | 'burned') => void
  clearConditions: (side: Side, slotId: string) => void
  toggleAbility: (side: Side, slotId: string) => void

  /* History visibility per side (per spec) */
  historyVisibleA: boolean
  historyVisibleB: boolean
  toggleHistoryVisible: (side: Side) => void
}

const defaultMarkers = { poisoned: false, burned: false }

function newSlot(position: 'active' | 'bench'): BoardSlot {
  return {
    id: nanoid(),
    position,
    damage: 0,
    energies: [],
    orientation: null,
    markers: { ...defaultMarkers },
    abilityUsed: false,
  }
}

function createSlots(benchSize: number): BoardSlot[] {
  return [
    newSlot('active'),
    ...Array.from({ length: benchSize }, () => newSlot('bench')),
  ]
}

function getField(state: MatchState, side: Side): FieldSide {
  return side === 'a' ? state.fieldA : state.fieldB
}

function fieldKey(side: Side): 'fieldA' | 'fieldB' {
  return side === 'a' ? 'fieldA' : 'fieldB'
}

function updateSlots(
  field: FieldSide,
  updater: (slots: BoardSlot[]) => BoardSlot[]
): FieldSide {
  return { slots: updater(field.slots) }
}

const initialModules: GameModules = { coins: true, energy: false, board: true }

export const useMatchStore = create<MatchState>()(
  persist(
    (set, get) => ({
      matchId: null,
      startedAt: null,
      opponentName: undefined,

      format: 'standard',
      modules: initialModules,
      energyPool: [],
      active: false,
      turn: 0,
      fieldA: { slots: [] },
      fieldB: { slots: [] },
      energyA: null,
      energyB: null,
      prize: { a: 6, b: 6 },
      history: [],

      historyVisibleA: false,
      historyVisibleB: false,

      startMatch: ({ opponentName }) => {
        const { format } = get()
        const { benchSize } = FORMAT_DEFAULTS[format]
        set({
          matchId: nanoid(),
          startedAt: Date.now(),
          opponentName,
          active: true,
          turn: 1,
          fieldA: { slots: createSlots(benchSize) },
          fieldB: { slots: createSlots(benchSize) },
          energyA: null,
          energyB: null,
          prize: { a: 6, b: 6 },
          history: [],
        })
      },

      endMatch: () =>
        set({
          matchId: null,
          startedAt: null,
          opponentName: undefined,
          active: false,
          turn: 0,
          fieldA: { slots: [] },
          fieldB: { slots: [] },
          energyA: null,
          energyB: null,
          prize: { a: 6, b: 6 },
          history: [],
        }),

      takePrize: (side) =>
        set((s) => ({
          prize: { ...s.prize, [side]: Math.max(0, s.prize[side] - 1) },
          history: [...s.history, {
            id: nanoid(),
            side,
            type: 'prize' as const,
            summary: `Prize taken (${Math.max(0, s.prize[side] - 1)} left)`,
            description: 'Prize taken',
            timestamp: Date.now(),
          }],
        })),

      logAction: (side, type, summary) =>
        set((s) => ({
          history: [...s.history, {
            id: nanoid(),
            side,
            type,
            summary,
            description: summary,
            timestamp: Date.now(),
          }],
        })),

      setFormat: (format) => {
        const defaults = FORMAT_DEFAULTS[format]
        set({ format, modules: { ...defaults.modules } })
      },
      setModules: (modules) => set({ modules }),
      setEnergyPool: (pool) => set({ energyPool: pool }),

      /** legacy alias of startMatch with no opponent — kept for any direct callers in old setup UI. */
      startGame: () => get().startMatch({}),
      /** legacy alias of endMatch. */
      endGame: () => get().endMatch(),

      nextTurn: () =>
        set(() => ({
          turn: get().turn + 1,
          energyA: null,
          energyB: null,
        })),

      generateEnergy: (side) => {
        const { energyPool } = get()
        if (energyPool.length === 0) return
        const energy = energyPool[Math.floor(Math.random() * energyPool.length)]
        set(side === 'a' ? { energyA: energy } : { energyB: energy })
      },

      addDamage: (side, slotId, amount) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => sl.id === slotId
              ? { ...sl, damage: Math.max(0, sl.damage + amount) }
              : sl)
          ),
        })),

      clearDamage: (side, slotId) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => (sl.id === slotId ? { ...sl, damage: 0 } : sl))
          ),
        })),

      attachEnergy: (side, slotId, energy) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => sl.id === slotId
              ? { ...sl, energies: [...sl.energies, energy] }
              : sl)
          ),
        })),

      removeEnergy: (side, slotId, index) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => sl.id === slotId
              ? { ...sl, energies: sl.energies.filter((_, i) => i !== index) }
              : sl)
          ),
        })),

      removeOneEnergy: (side, slotId, energy) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => {
              if (sl.id !== slotId) return sl
              const idx = sl.energies.indexOf(energy)
              if (idx === -1) return sl
              return { ...sl, energies: sl.energies.filter((_, i) => i !== idx) }
            })
          ),
        })),

      clearEnergies: (side, slotId) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => (sl.id === slotId ? { ...sl, energies: [] } : sl))
          ),
        })),

      addSlot: (side) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) => [
            ...slots, newSlot('bench'),
          ]),
        })),

      removeSlot: (side, slotId) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.filter((sl) => sl.id !== slotId)
          ),
        })),

      swapSlots: (side, fromId, toId) =>
        set((s) => {
          const field = getField(s, side)
          const fromIdx = field.slots.findIndex((sl) => sl.id === fromId)
          const toIdx = field.slots.findIndex((sl) => sl.id === toId)
          if (fromIdx === -1 || toIdx === -1) return {}
          const newSlots = [...field.slots]
          const fromPos = newSlots[fromIdx].position
          const toPos = newSlots[toIdx].position
          const clearConds = {
            orientation: null as OrientationCondition,
            markers: { ...defaultMarkers },
          }
          newSlots[fromIdx] = {
            ...newSlots[fromIdx], position: toPos,
            ...(toPos === 'bench' ? clearConds : {}),
          }
          newSlots[toIdx] = {
            ...newSlots[toIdx], position: fromPos,
            ...(fromPos === 'bench' ? clearConds : {}),
          }
          ;[newSlots[fromIdx], newSlots[toIdx]] = [newSlots[toIdx], newSlots[fromIdx]]
          const summary = `${fromPos} ↔ ${toPos}`
          return {
            [fieldKey(side)]: { slots: newSlots },
            history: [...s.history, {
              id: nanoid(), side, type: 'move' as const,
              summary, description: summary, timestamp: Date.now(),
            }],
          }
        }),

      setOrientation: (side, slotId, condition) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => sl.id === slotId
              ? { ...sl, orientation: condition } : sl)
          ),
        })),

      toggleMarker: (side, slotId, marker) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => sl.id === slotId
              ? { ...sl, markers: { ...sl.markers, [marker]: !sl.markers[marker] } }
              : sl)
          ),
        })),

      clearConditions: (side, slotId) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => sl.id === slotId
              ? { ...sl, orientation: null, markers: { poisoned: false, burned: false } }
              : sl)
          ),
        })),

      toggleAbility: (side, slotId) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => sl.id === slotId
              ? { ...sl, abilityUsed: !sl.abilityUsed } : sl)
          ),
        })),

      toggleHistoryVisible: (side) =>
        set((s) => side === 'a'
          ? { historyVisibleA: !s.historyVisibleA }
          : { historyVisibleB: !s.historyVisibleB }
        ),
    }),
    {
      name: 'pokemon-tools/match/v1',
      version: 1,
      merge: (persisted, current) => {
        const state = { ...current, ...(persisted as Partial<MatchState>) }
        function migrateSlots(field: FieldSide): FieldSide {
          return {
            slots: field.slots.map((sl) => ({
              ...sl,
              orientation: sl.orientation ?? null,
              markers: sl.markers ?? { poisoned: false, burned: false },
              abilityUsed: sl.abilityUsed ?? false,
            })),
          }
        }
        if (state.fieldA?.slots?.length) state.fieldA = migrateSlots(state.fieldA)
        if (state.fieldB?.slots?.length) state.fieldB = migrateSlots(state.fieldB)
        // Backfill new fields if absent
        if (state.matchId === undefined) state.matchId = null
        if (state.startedAt === undefined) state.startedAt = null
        if (state.prize === undefined) state.prize = { a: 6, b: 6 }
        if (state.historyVisibleA === undefined) state.historyVisibleA = false
        if (state.historyVisibleB === undefined) state.historyVisibleB = false
        // Backfill summary on history entries
        state.history = (state.history ?? []).map((h: GameAction) => ({
          ...h, summary: h.summary ?? h.description ?? '',
        }))
        return state
      },
    }
  )
)

/** Backwards-compatible alias for legacy code paths. */
export const useGameStore = useMatchStore

export function flipCoins(count: number): boolean[] {
  return Array.from({ length: count }, () => Math.random() >= 0.5)
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- --run src/stores/match-store.test.ts`
Expected: 4 tests pass.

- [ ] **Step 6: Type-check**

Run: `npm run typecheck`
Expected: passes (the alias `useGameStore = useMatchStore` keeps existing imports valid).

- [ ] **Step 7: Commit**

```bash
git add src/stores/match-store.ts src/stores/match-store.test.ts
git commit -m "feat(stores): port match-store with opponent/prize/summary extensions"
```

---

## Phase 3 — Routing & shell

### Task 9: Add Header layout component

**Files:**
- Create: `src/components/layout/header.tsx`

- [ ] **Step 1: Create the Header component**

Create `src/components/layout/header.tsx`:

```tsx
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

type BackProp = { to: string } | { onClick: () => void }

export type HeaderProps = {
  title?: string
  back?: BackProp
  actions?: ReactNode
}

export function Header({ title, back, actions }: HeaderProps) {
  const navigate = useNavigate()

  function handleBack() {
    if (!back) return
    if ('to' in back) navigate(back.to)
    else back.onClick()
  }

  return (
    <header className="sticky top-0 z-30 h-14 px-4 flex items-center gap-3
                       bg-surface-container-low border-b border-outline-variant">
      {back && (
        <button
          onClick={handleBack}
          aria-label="Back"
          className="p-2 -ml-2 rounded-md hover:bg-surface-container active:bg-surface-container-high"
        >
          <ArrowLeft strokeWidth={2} className="w-5 h-5" />
        </button>
      )}
      <Link to="/" className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-sm bg-primary-container" aria-hidden />
        <span className="font-bold tracking-wide text-primary text-xs uppercase whitespace-nowrap">
          Pokemon-Tools
        </span>
        {title && (
          <>
            <span className="text-outline-variant px-1" aria-hidden>|</span>
            <span className="text-on-surface-variant text-xs uppercase tracking-wider truncate">
              {title}
            </span>
          </>
        )}
      </Link>
      <div className="flex-1" />
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/header.tsx
git commit -m "feat(layout): add Header with back, logo and actions slots"
```

---

### Task 10: Rewrite App.tsx with new routes (no TabBar)

**Files:**
- Modify (rewrite): `src/App.tsx`

- [ ] **Step 1: Rewrite App.tsx**

Replace `src/App.tsx` entirely with:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { IndexPage } from '@/pages/index'
import { BinderListPage } from '@/pages/binder-list'
import { BinderDetailPage } from '@/pages/binder-detail'
import { PlayLandingPage } from '@/pages/play-landing'
import { PlaySetupPage } from '@/pages/play-setup'
import { PlayMatchPage } from '@/pages/play-match'
import { SettingsPage } from '@/pages/settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<IndexPage />} />
        <Route path="/binder"         element={<BinderListPage />} />
        <Route path="/binder/:id"     element={<BinderDetailPage />} />
        <Route path="/play"           element={<PlayLandingPage />} />
        <Route path="/play/new"       element={<PlaySetupPage />} />
        <Route path="/play/match"     element={<PlayMatchPage />} />
        <Route path="/settings"       element={<SettingsPage />} />
        {/* Legacy redirects */}
        <Route path="/colecao"        element={<Navigate to="/binder" replace />} />
        <Route path="/colecao/:id"    element={<Navigate to="/binder" replace />} />
        <Route path="/jogar"          element={<Navigate to="/play" replace />} />
        <Route path="/config"         element={<Navigate to="/settings" replace />} />
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

(All page imports will fail compile until Phases 4–7 land. **Don't try to typecheck or build yet.** This task only stages the routing skeleton.)

- [ ] **Step 2: Create stub pages so type-check passes**

Create each of these stub files with the exact content shown (copy-paste each block):

`src/pages/index.tsx`:
```tsx
export function IndexPage() { return <div /> }
```

`src/pages/binder-list.tsx`:
```tsx
export function BinderListPage() { return <div /> }
```

`src/pages/binder-detail.tsx`:
```tsx
export function BinderDetailPage() { return <div /> }
```

`src/pages/play-landing.tsx`:
```tsx
export function PlayLandingPage() { return <div /> }
```

`src/pages/play-setup.tsx`:
```tsx
export function PlaySetupPage() { return <div /> }
```

`src/pages/play-match.tsx`:
```tsx
export function PlayMatchPage() { return <div /> }
```

`src/pages/settings.tsx` (overwrite the existing one — we'll properly implement it in Task 24):
```tsx
export function SettingsPage() { return <div /> }
```

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit (skeleton)**

```bash
git add src/App.tsx src/pages/
git commit -m "feat(routing): introduce stack routes and stub new pages"
```

---

## Phase 4 — Index page

### Task 11: TacticalCard component

**Files:**
- Create: `src/components/shared/tactical-card.tsx`

- [ ] **Step 1: Create TacticalCard**

Create `src/components/shared/tactical-card.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type TacticalCardProps = {
  icon: LucideIcon
  title: string
  subtitle: string
  cta: string
  to: string
  decorIcon?: LucideIcon
  badge?: ReactNode
}

export function TacticalCard({
  icon: Icon, title, subtitle, cta, to, decorIcon: Decor, badge,
}: TacticalCardProps) {
  return (
    <Link
      to={to}
      className="relative block p-6 rounded-xl bg-surface-container border border-outline-variant
                 hover:border-outline transition-colors overflow-hidden"
    >
      {Decor && (
        <Decor
          aria-hidden
          className="absolute -right-4 -bottom-4 w-32 h-32 text-on-surface-variant opacity-10"
          strokeWidth={1.5}
        />
      )}
      {badge && (
        <div className="absolute top-3 right-3">{badge}</div>
      )}
      <div className="w-10 h-10 rounded-md bg-primary-container/20
                      flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-primary-container" strokeWidth={2} />
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant mb-8">{subtitle}</p>
      <div className="flex items-center gap-1 text-primary-container text-xs font-bold uppercase tracking-wider">
        {cta} <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/tactical-card.tsx
git commit -m "feat(shared): add TacticalCard component for Index"
```

---

### Task 12: StatusPanel component

**Files:**
- Create: `src/components/shared/status-panel.tsx`

- [ ] **Step 1: Create StatusPanel**

Create `src/components/shared/status-panel.tsx`:

```tsx
import packageJson from '../../../package.json'

type Row = { label: string; value: string }

const rows: Row[] = [
  { label: 'DATABASE STATUS',  value: `UP TO DATE (V.${packageJson.version})` },
  { label: 'ACTIVE SESSIONS',  value: '1 ANALYST' },
  { label: 'REGIONAL LATENCY', value: 'OPTIMAL' },
]

export function StatusPanel() {
  return (
    <section className="p-5 rounded-xl bg-surface-container border border-outline-variant">
      {rows.map((r, idx) => (
        <div
          key={r.label}
          className={`flex flex-col gap-1 pl-3 border-l-2 ${
            idx === 0 ? 'border-primary-container' : 'border-outline-variant'
          } ${idx > 0 ? 'mt-4' : ''}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            {r.label}
          </span>
          <span className="text-sm font-semibold text-on-surface">{r.value}</span>
        </div>
      ))}
    </section>
  )
}
```

(Note: requires `tsconfig` to allow JSON import. If the build complains, add `"resolveJsonModule": true` to `tsconfig.app.json` `compilerOptions`. Many Vite configs enable this by default.)

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/status-panel.tsx
git commit -m "feat(shared): add StatusPanel reading version from package.json"
```

---

### Task 13: IndexPage (`/`)

**Files:**
- Modify (rewrite the stub): `src/pages/index.tsx`

- [ ] **Step 1: Implement IndexPage**

Replace `src/pages/index.tsx` with:

```tsx
import { Folder, Gamepad2, Settings as SettingsIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/header'
import { TacticalCard } from '@/components/shared/tactical-card'
import { StatusPanel } from '@/components/shared/status-panel'
import { useMatchStore } from '@/stores/match-store'

export function IndexPage() {
  const hasMatch = useMatchStore((s) => s.active)

  return (
    <div className="min-h-screen pb-12">
      <Header
        actions={
          <Link
            to="/settings"
            aria-label="Settings"
            className="p-2 rounded-md hover:bg-surface-container"
          >
            <SettingsIcon strokeWidth={2} className="w-5 h-5 text-on-surface-variant" />
          </Link>
        }
      />
      <main className="px-4 max-w-screen-md mx-auto">
        <p className="mt-8 text-xs font-bold uppercase tracking-wider text-primary-container">
          System Online
        </p>
        <h1 className="mt-2 text-5xl font-extrabold leading-tight text-on-surface">
          Welcome<br/>back, Trainer.
        </h1>
        <div className="mt-3 h-1 w-12 bg-primary-container rounded-full" />

        <div className="mt-10 flex flex-col gap-4">
          <TacticalCard
            icon={Folder}
            decorIcon={Folder}
            title="Binder Manager"
            subtitle="Manage collections & master sets."
            cta="Initialize Data"
            to="/binder"
          />
          <TacticalCard
            icon={Gamepad2}
            decorIcon={Gamepad2}
            title="Battle Assistant"
            subtitle="Track damage, status & energy."
            cta="Launch Interface"
            to="/play"
            badge={hasMatch ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1
                               rounded-full bg-secondary-container text-on-secondary-container">
                In Progress
              </span>
            ) : undefined}
          />
        </div>

        <div className="mt-10">
          <StatusPanel />
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Run dev and visually check `/`**

Run: `npm run dev`
Open the printed URL. You should see the dark-mode Index with two tactical cards and the status panel. Click each card → goes to `/binder` and `/play` respectively (those will show empty stub pages — fine for now).
Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.tsx
git commit -m "feat(pages): build IndexPage with tactical cards and status panel"
```

---

## Phase 5 — Binder feature

> **For all "move + restyle" tasks below**, the procedure is:
> 1. `git mv` the existing file from `src/components/app/X.tsx` to `src/components/binder/X.tsx` (or `play/`).
> 2. Update its imports (e.g. `'@/store'` → `'@/stores/binder-store'`).
> 3. Replace classNames using the **token mapping table** below. Don't touch the JSX structure or hook logic.

### Token mapping table (apply throughout binder/ and play/ restyle tasks)

| Old class                                  | Replace with                                    |
|---|---|
| `bg-zinc-900`, `bg-neutral-900`, `bg-black` | `bg-surface`                                    |
| `bg-zinc-800`, `bg-neutral-800`             | `bg-surface-container`                          |
| `bg-zinc-700`                               | `bg-surface-container-high`                     |
| `bg-red-500`, `bg-red-600`                  | `bg-primary-container text-on-primary-container`|
| `text-red-500`, `text-red-600`              | `text-primary-container`                        |
| `text-white`                                | `text-on-surface`                               |
| `text-zinc-400`, `text-gray-400`            | `text-on-surface-variant`                       |
| `text-zinc-500`, `text-gray-500`            | `text-on-surface-variant`                       |
| `border-zinc-800`, `border-neutral-800`     | `border-outline-variant`                        |
| `border-zinc-700`                           | `border-outline`                                |
| `rounded-lg`                                | `rounded-xl`                                    |
| `rounded-md`                                | `rounded-md` (unchanged)                        |
| `font-mono uppercase` (labels)              | add `tracking-wider text-xs` for label-caps     |

### Task 14: Move + restyle FolderCard, EditFolderDrawer, SilhouetteCanvas

**Files:**
- Move: `src/components/app/folder-card.tsx` → `src/components/binder/folder-card.tsx`
- Move: `src/components/app/edit-folder-drawer.tsx` → `src/components/binder/edit-folder-drawer.tsx`
- Move: `src/components/app/silhouette-canvas.tsx` → `src/components/binder/silhouette-canvas.tsx`

- [ ] **Step 1: Move the files**

```bash
git mv src/components/app/folder-card.tsx src/components/binder/folder-card.tsx
git mv src/components/app/edit-folder-drawer.tsx src/components/binder/edit-folder-drawer.tsx
git mv src/components/app/silhouette-canvas.tsx src/components/binder/silhouette-canvas.tsx
```

- [ ] **Step 2: Update imports inside each moved file**

In each file, change any import from `@/store` to `@/stores/binder-store` and any import from `@/pokemon-data` to `@/lib/pokemon`. Adjust function/type names if they differ (e.g. `useBinderStore`, `Folder` → `Binder`).

**Important:** The new `Binder` type's fields differ from the old `Folder` (no `cols/rows/back/mode/totalSlots/slots`; instead `region/grid/coverPokemonId/isMain/ownedSlots`). Update internal references accordingly. Where the old code computed totals from `folder.totalSlots`, replace with `getPokemonByRegion(binder.region).length`.

- [ ] **Step 3: Apply token mapping table to className strings**

Walk every `className=...` in the moved files and apply substitutions from the table. No structural JSX changes.

- [ ] **Step 4: Update FolderCard prop type to use Binder**

In `folder-card.tsx`, ensure the props are:

```ts
import type { Binder } from '@/stores/binder-store'
import { getPokemonByRegion, getSpriteUrl } from '@/lib/pokemon'

type FolderCardProps = {
  binder: Binder
  onClick: () => void
  onMenu?: () => void
}
```

Inside, derive `total = getPokemonByRegion(binder.region).length` and `owned = binder.ownedSlots.length`. Cover image: if `binder.coverPokemonId` is set, use `getSpriteUrl(binder.coverPokemonId)`; else render a CSS gradient `bg-gradient-to-br from-primary-container/30 to-secondary-container/20`.

- [ ] **Step 5: Type-check**

Run: `npm run typecheck`
Expected: passes (you may need to fix lingering imports in pages/binder.tsx — that file is being replaced in Task 18).

If the type-check fails on `pages/binder.tsx` complaining about props mismatch, **leave the page broken for now**; we will replace it in Task 18. To make CI green in the meantime, you can briefly comment out the JSX body of that page returning `<div />`.

- [ ] **Step 6: Commit**

```bash
git add -A src/components/
git commit -m "refactor(binder): move FolderCard/EditFolderDrawer/Silhouette into binder/ and adopt Binder type"
```

---

### Task 15: Move + restyle CreateModal with Region picker

**Files:**
- Move: `src/components/app/create-modal.tsx` → `src/components/binder/create-modal.tsx`

- [ ] **Step 1: Move the file**

```bash
git mv src/components/app/create-modal.tsx src/components/binder/create-modal.tsx
```

- [ ] **Step 2: Replace the management-mode toggle with Region picker**

Open the moved file. The existing modal exposes a `mode: 'pokedex' | 'free'` toggle. Replace that whole block with a Region segmented control. Concretely:

- Add import: `import { REGIONS, type RegionKey } from '@/lib/pokemon'`.
- Replace the `mode` state with `const [region, setRegion] = useState<RegionKey>('kanto')`.
- Render a horizontally-scrollable row of pill buttons, one per `REGIONS` entry, with the selected style being `bg-primary-container text-on-primary-container`. Unselected: `bg-surface-container-high text-on-surface-variant`.
- Default name auto-fills as `Pokédex – ${REGIONS.find(r=>r.key===region)?.label}` if the user hasn't typed anything.
- Cover image picker (existing) stays as-is; relabel to "Cover Pokemon (optional)".
- Grid configuration buttons (3×3, 4×3, 2×2, 4×4) keep working but values map to `'3x3' | '4x3' | '2x2' | '4x4'`.

On submit, call:

```ts
useBinderStore.getState().createBinder({
  name: nameOrDefault,
  region,
  grid,
  coverPokemonId,
})
```

Then `navigate('/binder')` (already in modal flow, just keep it).

- [ ] **Step 3: Apply token mapping table to all classNames**

- [ ] **Step 4: Type-check + manual smoke**

Run: `npm run typecheck` — passes.
Run: `npm run dev` and from `/binder` (currently empty) trigger the create modal once it's wired (Task 17). For now just confirm no compile errors.

- [ ] **Step 5: Commit**

```bash
git add -A src/components/binder/create-modal.tsx
git commit -m "refactor(binder): replace mode toggle with Region picker in CreateModal"
```

---

### Task 16: BinderSlot and BinderPaginator (move + restyle)

**Files:**
- Move: `src/components/app/binder-page.tsx` → `src/components/binder/binder-paginator.tsx`
- Create: `src/components/binder/binder-slot.tsx`
- Delete: `src/components/app/pokemon-card.tsx` (after extracting needed pieces)

- [ ] **Step 1: Move binder-page.tsx**

```bash
git mv src/components/app/binder-page.tsx src/components/binder/binder-paginator.tsx
```

- [ ] **Step 2: Create BinderSlot**

Read `src/components/app/pokemon-card.tsx` first to lift any rendering logic worth keeping (e.g. silhouette-vs-sprite swap). Then create `src/components/binder/binder-slot.tsx`:

```tsx
import { useState } from 'react'
import { getPokemon, getSpriteUrl } from '@/lib/pokemon'
import { SilhouetteCanvas } from './silhouette-canvas'

export type BinderSlotProps = {
  pokemonId: number
  owned: boolean
  onToggle: () => void
}

export function BinderSlot({ pokemonId, owned, onToggle }: BinderSlotProps) {
  const pokemon = getPokemon(pokemonId)
  const [imgFailed, setImgFailed] = useState(false)
  const showSprite = owned && !imgFailed

  return (
    <button
      onClick={onToggle}
      className={`group relative aspect-square rounded-md overflow-hidden border
                  ${owned ? 'border-outline bg-surface-container-high' : 'border-outline-variant bg-surface-container'}
                  hover:border-primary-container transition-colors`}
      aria-label={`${pokemon?.name ?? 'Slot'} — ${owned ? 'owned' : 'missing'}`}
    >
      {showSprite ? (
        <img
          src={getSpriteUrl(pokemonId)}
          alt={pokemon?.name ?? `#${pokemonId}`}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <SilhouetteCanvas pokemonId={pokemonId} />
      )}
      <span className="absolute bottom-0 inset-x-0 px-1 py-0.5
                       text-[10px] font-bold uppercase tracking-wider text-on-surface
                       bg-surface-container-lowest/70 truncate">
        #{pokemonId} {pokemon?.name}
      </span>
    </button>
  )
}
```

(If `SilhouetteCanvas` exports a different prop or path, adjust accordingly to whatever `silhouette-canvas.tsx` exposes.)

- [ ] **Step 3: Restyle BinderPaginator and update its data flow**

Open `src/components/binder/binder-paginator.tsx`. It currently expects a `Folder` from the old store. Refactor it to:
- Accept `binder: Binder` prop.
- Compute `pokemons = getPokemonByRegion(binder.region)`.
- Compute `gridConfig = parseFormat(binder.grid)` (use `lib/binder-math`).
- Render pages of `pokemons` sliced by `slotRangeForPage`.
- Each rendered cell is `<BinderSlot pokemonId={p.id} owned={binder.ownedSlots.includes(p.id)} onToggle={() => toggleSlotOwned(binder.id, p.id)} />`.

Apply token mapping table to className strings.

- [ ] **Step 4: Delete the obsolete pokemon-card.tsx**

```bash
git rm src/components/app/pokemon-card.tsx
```

- [ ] **Step 5: Type-check**

Run: `npm run typecheck`
Expected: passes (or only the to-be-replaced page complaining — comment those out if needed).

- [ ] **Step 6: Commit**

```bash
git add -A src/components/binder/
git commit -m "feat(binder): add BinderSlot and convert paginator to regional Binder"
```

---

### Task 17: BinderListPage (`/binder`)

**Files:**
- Modify (rewrite stub): `src/pages/binder-list.tsx`

- [ ] **Step 1: Implement BinderListPage**

Replace `src/pages/binder-list.tsx` with:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { FolderCard } from '@/components/binder/folder-card'
import { CreateModal } from '@/components/binder/create-modal'
import { useBinderStore } from '@/stores/binder-store'

export function BinderListPage() {
  const navigate = useNavigate()
  const binders = useBinderStore((s) => s.binders)
  const [creating, setCreating] = useState(false)

  return (
    <div className="min-h-screen pb-24">
      <Header back={{ to: '/' }} title="Binder Manager" />
      <main className="px-4 max-w-screen-md mx-auto">
        <h1 className="mt-6 text-3xl font-extrabold text-on-surface">Minha Coleção</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Gerencie seus binders e acompanhe o progresso do seu deck competitivo.
        </p>

        <button
          onClick={() => setCreating(true)}
          className="mt-6 w-full py-3 rounded-xl bg-primary-container text-on-primary-container
                     font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2"
        >
          <Plus strokeWidth={2.5} className="w-4 h-4" /> New Binder
        </button>

        {binders.length === 0 ? (
          <div className="mt-12 p-8 rounded-xl bg-surface-container border border-outline-variant text-center">
            <p className="text-on-surface-variant">No binders yet. Tap "New Binder" to start.</p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            {binders.map((b) => (
              <FolderCard
                key={b.id}
                binder={b}
                onClick={() => navigate(`/binder/${b.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {creating && (
        <CreateModal
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  )
}
```

(If your `CreateModal`'s prop API differs, adjust the props at the call site to match. The contract is: it renders an overlay/drawer, calls `createBinder` on submit, and triggers `onClose`.)

- [ ] **Step 2: Manual smoke**

Run: `npm run dev`
- Go to `/binder` — empty state shown.
- Click "New Binder" — modal opens.
- Create a Pokédex–Kanto 3x3 binder with name "Test Kanto".
- Modal closes and the binder appears as a card.
- Click the card — should navigate to `/binder/<id>` (404 inline message until next task).

- [ ] **Step 3: Commit**

```bash
git add src/pages/binder-list.tsx
git commit -m "feat(pages): build BinderListPage with create flow"
```

---

### Task 18: BinderDetailPage (`/binder/:id`)

**Files:**
- Modify (rewrite stub): `src/pages/binder-detail.tsx`

- [ ] **Step 1: Implement BinderDetailPage**

Replace `src/pages/binder-detail.tsx` with:

```tsx
import { useNavigate, useParams } from 'react-router-dom'
import { Settings as SettingsIcon } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { BinderPaginator } from '@/components/binder/binder-paginator'
import { useBinderStore } from '@/stores/binder-store'
import { useState } from 'react'
import { EditFolderDrawer } from '@/components/binder/edit-folder-drawer'

export function BinderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const binder = useBinderStore((s) => s.binders.find((b) => b.id === id))
  const [editing, setEditing] = useState(false)

  if (!binder) {
    return (
      <div className="min-h-screen">
        <Header back={{ to: '/binder' }} title="Not Found" />
        <main className="px-4 mt-12 text-center text-on-surface-variant">
          Binder not found.
          <button
            onClick={() => navigate('/binder')}
            className="block mx-auto mt-4 underline text-primary-container"
          >
            Back to binders
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        back={{ to: '/binder' }}
        title={binder.name}
        actions={
          <button
            onClick={() => setEditing(true)}
            aria-label="Binder settings"
            className="p-2 rounded-md hover:bg-surface-container"
          >
            <SettingsIcon strokeWidth={2} className="w-5 h-5 text-on-surface-variant" />
          </button>
        }
      />
      <BinderPaginator binder={binder} />
      {editing && (
        <EditFolderDrawer
          binder={binder}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}
```

(Adjust `EditFolderDrawer` prop names to whatever the moved file actually exposes.)

- [ ] **Step 2: Manual smoke**

Run: `npm run dev`. From the binder list, open the Kanto binder. You should see paginated 3x3 grid of all 151 Kanto sprites (silhouettes initially). Tap a few — toggle sprite/silhouette. Reload — state persists.

- [ ] **Step 3: Commit**

```bash
git add src/pages/binder-detail.tsx
git commit -m "feat(pages): BinderDetailPage with paginator and edit drawer"
```

---

## Phase 6 — Play feature

### Task 19: Move all play components to play/ folder

**Files:**
- Move (each): `src/components/app/{game-table,field-side,board-slot,slot-popover,coin-modal,energy-badge,energy-indicator,game-history,game-setup}.tsx` → `src/components/play/...`

- [ ] **Step 1: Bulk move**

```bash
mkdir -p src/components/play
for f in game-table field-side board-slot slot-popover coin-modal energy-badge energy-indicator game-history game-setup; do
  if [ -f "src/components/app/$f.tsx" ]; then
    git mv "src/components/app/$f.tsx" "src/components/play/$f.tsx"
  fi
done
```

- [ ] **Step 2: Update imports inside each moved file**

For each moved file, replace:
- `'@/game-store'` → `'@/stores/match-store'`
- `'@/store'` (if it appears) → `'@/stores/binder-store'`
- `'@/pokemon-data'` → `'@/lib/pokemon'`
- relative imports inside `app/` (`./coin-modal`, `./slot-popover`, etc.) need no change (still siblings now under `play/`).

Run a sanity grep:

```bash
grep -rn "@/game-store" src/ || echo "none"
grep -rn "@/store" src/ | grep -v "stores/" || echo "none"
```

Both should return "none" after fixing.

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: passes (since `useGameStore` is exported as alias from `match-store.ts` in Task 8).

- [ ] **Step 4: Commit**

```bash
git add -A src/
git commit -m "refactor(play): move battle components into play/ and rewire imports"
```

---

### Task 20: Restyle play components with token mapping table

**Files:** All files under `src/components/play/`.

This is a sweep — apply the token mapping from Task 14's table to **every** className in:
- `game-table.tsx`
- `field-side.tsx`
- `board-slot.tsx`
- `slot-popover.tsx`
- `coin-modal.tsx`
- `energy-badge.tsx`
- `energy-indicator.tsx`
- `game-history.tsx`
- `game-setup.tsx`

- [ ] **Step 1: Apply substitutions, file by file**

For each file, walk every `className=...` attribute. Apply the table. Don't touch JSX structure or props.

- [ ] **Step 2: Special restyle for slot-popover.tsx**

Match the `card-options.png` layout: HP at top large, +/- damage buttons left/right of a centered current value, energy chips row, status condition grid 3×2 (Confused/Paralyzed/Asleep/Poisoned/Burned + 6th cell empty or for Asleep/awake?), bottom CTAs:
- "Use Ability" — `bg-secondary-container text-on-secondary-container` (per prototype)
- "Clear Damage" — `bg-surface-container-high text-on-surface`

Keep existing handlers wired the same.

- [ ] **Step 3: Special restyle for game-history.tsx**

Match `history-log.png`:
- Single timeline (no per-side split). Each row: icon (per `type`), title (`summary`), `OPPONENT`/`YOU` chip (use `side === 'b'` as YOU; you can flip if your existing convention is opposite — check existing renderer first), timestamp. Apply `bg-surface-container` border `outline-variant` to the row container.
- "Quick Stats" panel below the list:
  - **Prize Cards Left** — read `s.prize` from `useMatchStore`. Render `${prize.a} - ${prize.b}` in `text-primary-container` font-bold.
  - **Accuracy** and **Tempo** — show as label-caps + `--` value with `opacity-50` and `title="Em breve"`.

- [ ] **Step 4: Manual smoke (after PlayMatchPage exists in Task 23)**

Defer visual verification until Task 23. Just type-check now.

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add -A src/components/play/
git commit -m "style(play): apply M3 tokens and restyle slot-popover/game-history per prototype"
```

---

### Task 21: PlayLandingCard component

**Files:**
- Create: `src/components/play/play-landing-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useNavigate } from 'react-router-dom'
import { Play, Plus } from 'lucide-react'
import { useMatchStore } from '@/stores/match-store'

function timeAgo(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `há ${mins}min`
  const h = Math.floor(mins / 60)
  return `há ${h}h${mins % 60 ? ` ${mins % 60}min` : ''}`
}

export function PlayLandingCard() {
  const navigate = useNavigate()
  const active = useMatchStore((s) => s.active)
  const startedAt = useMatchStore((s) => s.startedAt)
  const opponentName = useMatchStore((s) => s.opponentName)
  const prize = useMatchStore((s) => s.prize)
  const endMatch = useMatchStore((s) => s.endMatch)

  function startNew() {
    if (active) {
      const ok = window.confirm('Existe uma batalha em andamento. Descartar e iniciar nova?')
      if (!ok) return
      endMatch()
    }
    navigate('/play/new')
  }

  if (active && startedAt) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/play/match')}
          className="p-5 rounded-xl bg-surface-container border border-outline-variant text-left
                     hover:border-outline transition-colors"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-primary-container">
            Continue Battle
          </p>
          <p className="mt-2 text-lg font-bold text-on-surface">
            {opponentName ? `vs ${opponentName}` : 'Match in progress'}
          </p>
          <p className="text-sm text-on-surface-variant">
            iniciada {timeAgo(startedAt)} · prize {prize.a}–{prize.b}
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-primary-container text-xs font-bold uppercase tracking-wider">
            Continue <Play className="w-3 h-3" strokeWidth={2.5} />
          </div>
        </button>
        <button
          onClick={startNew}
          className="text-sm text-on-surface-variant underline self-start"
        >
          New Battle (descarta atual)
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={startNew}
      className="w-full py-4 rounded-xl bg-primary-container text-on-primary-container
                 font-bold uppercase tracking-wider flex items-center justify-center gap-2"
    >
      <Plus strokeWidth={2.5} className="w-4 h-4" /> New Battle
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/play/play-landing-card.tsx
git commit -m "feat(play): add PlayLandingCard with continue/new logic"
```

---

### Task 22: MatchSettingsDrawer component

**Files:**
- Create: `src/components/play/match-settings-drawer.tsx`

- [ ] **Step 1: Create the drawer**

Use the existing vaul `<Drawer>` primitive in `src/components/ui/drawer.tsx`.

```tsx
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { useNavigate } from 'react-router-dom'
import { useMatchStore } from '@/stores/match-store'

type Props = { open: boolean; onClose: () => void }

export function MatchSettingsDrawer({ open, onClose }: Props) {
  const navigate = useNavigate()
  const endMatch = useMatchStore((s) => s.endMatch)
  const toggleHistoryVisible = useMatchStore((s) => s.toggleHistoryVisible)

  function handleEnd() {
    const ok = window.confirm('End this match? History will be cleared.')
    if (!ok) return
    endMatch()
    onClose()
    navigate('/play')
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-surface-container-high border-outline-variant">
        <DrawerHeader>
          <DrawerTitle className="text-on-surface uppercase tracking-wider text-sm">
            Match Settings
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 flex flex-col gap-2">
          <button
            onClick={() => { toggleHistoryVisible('a'); toggleHistoryVisible('b') }}
            className="py-3 rounded-md bg-surface-container text-on-surface text-left px-4"
          >
            Toggle history visibility (both sides)
          </button>
          <button
            onClick={handleEnd}
            className="py-3 rounded-md bg-error-container text-on-error-container text-left px-4 font-bold"
          >
            End Match
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/play/match-settings-drawer.tsx
git commit -m "feat(play): add MatchSettingsDrawer with end-match confirm"
```

---

### Task 23: PlayLandingPage, PlaySetupPage, PlayMatchPage

**Files:**
- Modify (rewrite stubs): `src/pages/play-landing.tsx`, `src/pages/play-setup.tsx`, `src/pages/play-match.tsx`

- [ ] **Step 1: PlayLandingPage**

Replace `src/pages/play-landing.tsx`:

```tsx
import { Header } from '@/components/layout/header'
import { PlayLandingCard } from '@/components/play/play-landing-card'

export function PlayLandingPage() {
  return (
    <div className="min-h-screen">
      <Header back={{ to: '/' }} title="Battle Assistant" />
      <main className="px-4 max-w-screen-md mx-auto mt-8">
        <PlayLandingCard />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: PlaySetupPage**

Read `src/pages/play.tsx` (the old combined page) to find where setup vs match render. Extract just the setup portion and copy into `src/pages/play-setup.tsx`. The setup uses `<GameSetup />` from `@/components/play/game-setup`. After setup completes, the existing flow probably calls `startGame()`. **Replace that call** with `startMatch({ opponentName })` (the setup form should now also collect an optional opponent name input).

Skeleton:

```tsx
import { Header } from '@/components/layout/header'
import { GameSetup } from '@/components/play/game-setup'
import { useNavigate } from 'react-router-dom'
import { useMatchStore } from '@/stores/match-store'
import { useState } from 'react'

export function PlaySetupPage() {
  const navigate = useNavigate()
  const startMatch = useMatchStore((s) => s.startMatch)
  const [opponentName, setOpponentName] = useState('')

  function handleStart() {
    startMatch({ opponentName: opponentName.trim() || undefined })
    navigate('/play/match')
  }

  return (
    <div className="min-h-screen">
      <Header back={{ to: '/play' }} title="New Battle" />
      <main className="px-4 max-w-screen-md mx-auto mt-6">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Opponent Name (optional)
          </span>
          <input
            value={opponentName}
            onChange={(e) => setOpponentName(e.target.value)}
            placeholder="AshK123"
            className="mt-1 w-full px-3 py-2 rounded-md bg-surface-container
                       border border-outline-variant focus:border-primary-container outline-none text-on-surface"
          />
        </label>
        <div className="mt-6">
          <GameSetup onComplete={handleStart} />
        </div>
      </main>
    </div>
  )
}
```

(If `GameSetup` doesn't take an `onComplete` prop today, find how it triggers start in the old `play.tsx` and adapt to call `handleStart` instead. Don't modify `GameSetup`'s internal layout beyond the className token swap from Task 20.)

- [ ] **Step 3: PlayMatchPage**

Replace `src/pages/play-match.tsx`:

```tsx
import { Navigate } from 'react-router-dom'
import { Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { GameTable } from '@/components/play/game-table'
import { MatchSettingsDrawer } from '@/components/play/match-settings-drawer'
import { useMatchStore } from '@/stores/match-store'

export function PlayMatchPage() {
  const active = useMatchStore((s) => s.active)
  const opponentName = useMatchStore((s) => s.opponentName)
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!active) return <Navigate to="/play" replace />

  return (
    <div className="min-h-screen">
      <Header
        back={{ to: '/play' }}
        title={opponentName ? `vs ${opponentName}` : 'Match'}
        actions={
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Match settings"
            className="p-2 rounded-md hover:bg-surface-container"
          >
            <SettingsIcon strokeWidth={2} className="w-5 h-5 text-on-surface-variant" />
          </button>
        }
      />
      <GameTable />
      <MatchSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
```

- [ ] **Step 4: Manual smoke**

Run: `npm run dev`. Walk: `/` → `/play` (no match) → "New Battle" → setup → start → `/play/match` shows the table. Tap a slot → popover opens; +30 damage works. Reload `/play/match` → state preserved. Go to `/play` → "Continue Battle" card visible. Click "New Battle" — confirm dialog appears.

- [ ] **Step 5: Commit**

```bash
git add src/pages/play-landing.tsx src/pages/play-setup.tsx src/pages/play-match.tsx
git commit -m "feat(pages): assemble Play landing, setup and match pages"
```

---

## Phase 7 — Settings

### Task 24: SettingsPage with Clear All Data

**Files:**
- Modify (rewrite): `src/pages/settings.tsx`

- [ ] **Step 1: Implement SettingsPage**

```tsx
import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { useSettingsStore } from '@/stores/settings-store'
import packageJson from '../../package.json'

export function SettingsPage() {
  const clearAllData = useSettingsStore((s) => s.clearAllData)
  const [confirming, setConfirming] = useState(false)
  const [iAmSure, setIAmSure] = useState(false)

  return (
    <div className="min-h-screen">
      <Header back={{ to: '/' }} title="Settings" />
      <main className="px-4 max-w-screen-md mx-auto mt-8">
        <section className="p-5 rounded-xl bg-surface-container border border-outline-variant">
          <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Data</h2>
          <button
            onClick={() => setConfirming(true)}
            className="mt-4 w-full py-3 rounded-md bg-error-container text-on-error-container font-bold"
          >
            Clear all data
          </button>
        </section>

        <p className="mt-12 text-center text-xs text-on-surface-variant">
          v{packageJson.version}
        </p>
      </main>

      {confirming && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
          <div className="bg-surface-container-high border border-outline-variant rounded-t-xl sm:rounded-xl
                          w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-on-surface">Apagar todos os dados?</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Apaga todos os binders, batalha em andamento e preferências. Não pode desfazer.
            </p>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={iAmSure}
                onChange={(e) => setIAmSure(e.target.checked)}
              />
              Tenho certeza
            </label>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => { setConfirming(false); setIAmSure(false) }}
                className="px-4 py-2 text-on-surface-variant"
              >
                Cancelar
              </button>
              <button
                onClick={clearAllData}
                disabled={!iAmSure}
                className="px-4 py-2 rounded-md bg-error-container text-on-error-container font-bold
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Manual smoke**

Run: `npm run dev`. Go to `/settings`. Try the destructive flow with the checkbox. Confirm it wipes localStorage keys (DevTools → Application → Local Storage) and reloads to `/`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/settings.tsx
git commit -m "feat(pages): SettingsPage with double-confirm clear-all-data"
```

---

## Phase 8 — Cleanup

### Task 25: Delete obsolete files

**Files to delete:**
- `src/store.ts`
- `src/game-store.ts`
- `src/settings-store.ts`
- `src/pokemon-data.ts`
- `src/components/app/tab-bar.tsx`
- `src/components/app/search-bar.tsx`
- `src/components/app/search-modal.tsx`
- `src/components/app/search-drawer.tsx`
- `src/pages/home.tsx`
- `src/pages/binder.tsx`
- `src/pages/play.tsx`
- The directory `src/components/app/` once empty

- [ ] **Step 1: Verify nothing still imports from old paths**

```bash
grep -rn "@/store" src/ | grep -v "stores/"
grep -rn "@/game-store" src/
grep -rn "@/settings-store" src/ | grep -v "stores/"
grep -rn "@/pokemon-data" src/
grep -rn "@/pages/home" src/
grep -rn "@/pages/binder['\"]" src/
grep -rn "@/pages/play['\"]" src/
grep -rn "tab-bar" src/
grep -rn "search-bar\|search-modal\|search-drawer" src/
```

For every match, fix the import. Do not proceed until all greps return empty.

- [ ] **Step 2: Delete the files**

```bash
git rm src/store.ts src/game-store.ts src/settings-store.ts src/pokemon-data.ts
git rm src/components/app/tab-bar.tsx src/components/app/search-bar.tsx
git rm src/components/app/search-modal.tsx src/components/app/search-drawer.tsx
git rm src/pages/home.tsx src/pages/binder.tsx src/pages/play.tsx
```

If `src/components/app/` is now empty:

```bash
rmdir src/components/app/
```

- [ ] **Step 3: Type-check, test, build**

Run: `npm run typecheck` — passes.
Run: `npm run test:ci` — all tests pass.
Run: `npm run build` — succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove obsolete stores, search UI, tab-bar and old pages"
```

---

## Phase 9 — Final verification

### Task 26: Run the manual checklist from the spec

**Files:** None modified — verification only.

- [ ] **Step 1: Run all automated gates**

```bash
npm run typecheck
npm run test:ci
npm run build
```

All three must pass.

- [ ] **Step 2: Run the manual checklist** (from spec, section "Manual verification checklist")

Open the spec file `docs/superpowers/specs/2026-04-27-pokemon-tools-remodel-design.md` and walk every checkbox in the **Manual verification checklist (pre-merge)** section. For any failure, file a follow-up note and either fix in place (small) or open a new task (large).

The full checklist (copy here for convenience):

```
[ ] npm run typecheck passes
[ ] npm run test passes
[ ] npm run dev opens / without console errors/warnings
[ ] Index: 2 cards clickable, navigate to /binder and /play
[ ] /binder empty: empty state + "New Binder" button
[ ] Create binder Pokédex–Kanto 3x3 → /binder/:id with 17 pages, 151 slots
[ ] Toggle owned on 3 slots → reload → state preserved
[ ] Cover reflects in list
[ ] Delete binder → confirm → removed
[ ] /play with no match: only "New Battle"
[ ] /play/new → setup → start → /play/match with correct state
[ ] /play/match: damage toggle on side A (rotate-180), modal opens correctly oriented
[ ] Coin flip side A: modal rotates; side B: doesn't
[ ] History panel: appends per action, summary readable
[ ] Reload on /play/match: state preserved, "Continue Battle" appears in /play
[ ] /settings → "Clear all data" → double confirm → wiped, redirect to /
[ ] Sprites with offline network: silhouette appears, slot still functional
[ ] Mobile (DevTools 375px): layout intact, headers fit
```

- [ ] **Step 3: Final commit (if any small fixes were needed)**

```bash
git add -A
git commit -m "fix: address manual verification follow-ups"
```

- [ ] **Step 4: Done**

The remodel is complete. Open a PR or merge to `main` per your workflow.

---

## Plan Self-Review (engineer reading: skip this section)

**Spec coverage:** Each spec section maps to tasks below.
- Branding rename → Task 1
- DESIGN.md tokens → Task 3
- Inter font → Task 3
- Routing (no bottom nav) → Task 10 (and tab-bar deleted in Task 25)
- Edge cases (`/binder/:id` not found, `/play/match` without active) → Task 18, Task 23
- Data layer + REGIONS + sprites → Task 4
- Stores (binder, match, settings) → Tasks 6, 7, 8
- Persistence keys + version → all three stores set `name`/`version`
- Set<Condition> handling preserved via existing game-store merge function → Task 8
- Header component → Task 9
- TacticalCard, StatusPanel → Tasks 11, 12, 13
- FolderCard, CreateModal, BinderSlot, BinderPaginator → Tasks 14, 15, 16
- BinderListPage, BinderDetailPage → Tasks 17, 18
- Play components restyle → Tasks 19, 20
- PlayLandingCard, MatchSettingsDrawer → Tasks 21, 22
- Play pages assembled → Task 23
- SettingsPage with clearAllData → Task 24
- Vitest unit tests → Tasks 4, 5, 7, 8
- Manual verification → Task 26

**Placeholder scan:** Searched for "TBD/TODO/etc" — none. All code blocks are complete.

**Type consistency:** `Binder` shape consistent across stores/binder-store.ts → folder-card → binder-paginator → binder-detail. `useMatchStore` exported from match-store.ts; `useGameStore` re-export keeps existing imports valid until cleaned up. Header props type identical at definition and use sites.

**Notable trade-off documented inline:** Task 8 deliberately preserves the existing rich `game-store` API (format, modules, energyPool, orientation, etc.) instead of reducing to the spec's idealized type. This honors "battle assistant works super well, só remodelar" and avoids regressing working features. The spec's `Match` shape is treated as the *target* (matchId/startedAt/opponentName/prize/summary added) rather than a from-scratch type.
