# Pokemon Tools — Remodel V1 Design

**Date:** 2026-04-27
**Status:** Approved (brainstorm complete)
**Scope:** V1 — Index hub + Binder Manager (Pokédex regional) + Battle Assistant remodel

## Context

The repo currently lives as `pokedex-tcg`, a React/Vite app with Battle Assistant features that "work super well" plus a partial binder system. The remodel:

1. Renames the project to **Pokemon Tools** internally + in `package.json` (folder/remote stay).
2. Introduces a tactical-HUD visual identity defined in `DESIGN.md` (Material 3 token frontmatter as source of truth).
3. Restructures navigation into a stack model (no bottom nav).
4. Refactors Binder around regional Pokédex modes.
5. Restyles Battle Assistant + adds match persistence and history adapted to the new layout.

Out of scope (V2): Custom binder mode, TCG Master Sets with variants (holo/reverse/full art), pull tracker, deck builder, damage calculator, trade log, wishlist, undo. See `docs/ideas/future-tools.md`.

## Goals

- Single visual language across all screens, anchored in `DESIGN.md` tokens.
- Multi-binder management, each binder = a regional Pokédex (Kanto, Johto, ..., or National).
- Owned/missing tracking per slot with sprite-based rendering.
- Battle Assistant preserves all existing functionality, restyled, plus survives reload (single active match).
- Routing = pure stack: every screen has a header, back via header, no persistent bottom nav.

## Non-goals

- Custom binders (V2).
- Per-slot specific TCG print selection (V2 with Master Sets).
- Multi-match history.
- API-backed pokemon data (static JSON is enough).
- E2E tests.

## Architecture

### Routes

```
/                  IndexPage          — welcome + 2 tool cards + status panel
/binder            BinderListPage     — list of binders + create CTA
/binder/:id        BinderDetailPage   — paginated grid of slots
/play              PlayLandingPage    — Continue Battle | New Battle
/play/new          PlaySetupPage      — match setup (existing, restyled)
/play/match        PlayMatchPage      — match in progress (restyled)
/settings          SettingsPage       — global settings (V1: Clear all data)
*                  Navigate to "/"
```

Edge cases:
- `/binder/:id` with unknown id → inline empty state ("Binder not found" + back link to `/binder`). No dedicated `NotFound` component needed.
- `/play/match` without `activeMatch` → `<Navigate to="/play" replace />`.

### Folder structure

```
src/
├── main.tsx
├── App.tsx                       # routes
├── index.css                     # Tailwind v4 + M3 tokens as CSS vars
│
├── components/
│   ├── ui/                       # shadcn primitives, restyled
│   ├── layout/
│   │   └── header.tsx
│   ├── binder/                   # folder-card, create-modal, slot, paginator
│   ├── play/                     # game-table, field-side, slot-popover, coin-modal, history
│   └── shared/                   # tactical-card, status-panel, status-chip
│
├── pages/
│   ├── index.tsx
│   ├── binder-list.tsx
│   ├── binder-detail.tsx
│   ├── play-landing.tsx
│   ├── play-setup.tsx
│   ├── play-match.tsx
│   └── settings.tsx
│
├── stores/
│   ├── binder-store.ts
│   ├── match-store.ts
│   └── settings-store.ts
│
├── lib/
│   ├── pokemon.ts                # REGIONS, getPokemonByRegion, getSpriteUrl
│   ├── binder-math.ts
│   └── utils.ts
│
└── data/
    └── pokemon.json              # already exists, source of truth
```

Changes vs current state:
- `components/app/` splits into `components/{binder,play,shared}/`.
- 3 stores move from `src/` into `src/stores/`.
- `pages/binder.tsx` and `pages/play.tsx` split into list/detail and landing/setup/match respectively.
- `tab-bar.tsx` is **deleted** (no bottom nav).
- `pokemon-data.ts` is removed if it duplicates `data/pokemon.json`; otherwise consolidates into `lib/pokemon.ts`.

### Branding rename (scope B)

- `package.json` `name`: `pokedex-tcg` → `pokemon-tools`.
- `<title>` in `index.html`: `POKEMON-TOOLS`.
- Header logo text: `POKEMON-TOOLS`.
- README updated.
- Folder name and git remote stay as `pokedex-tcg`.

## Components

### Layout

**`Header`** (new) — `components/layout/header.tsx`
```ts
type HeaderProps = {
  title?: string                                       // uppercase label-caps
  back?: { to: string } | { onClick: () => void }
  actions?: ReactNode                                  // ⚙️, 🔍, 🔔
}
```
Renders: `[← back] POKEMON-TOOLS | title` left, `actions` right. 56px tall, `surface-container-low` bg, `outline-variant` bottom border. Tapping the logo navigates to `/`.

### Index (`/`)

**`TacticalCard`** (new) — `components/shared/tactical-card.tsx`
```ts
type TacticalCardProps = {
  icon: LucideIcon
  title: string
  subtitle: string
  cta: string                          // label-caps
  to: string
  decorIcon?: LucideIcon               // watermark, opacity-10
}
```
Card with 16px radius, `surface-container` bg, icon in `primary-container` square tile, watermark right side, CTA in `primary` color with `>`. Whole card is a `<Link>`.

**`StatusPanel`** (new) — `components/shared/status-panel.tsx`
3 rows of label-caps + value:
- `DATABASE STATUS / UP TO DATE (V.{packageVersion})`
- `ACTIVE SESSIONS / 1 ANALYST`
- `REGIONAL LATENCY / OPTIMAL`

Values mostly placeholder (decorative tactical telemetry). `packageVersion` is the only live value (read at build via Vite `import.meta.env`).

### Binder

**`FolderCard`** (refactored from existing) — `components/binder/folder-card.tsx`
```ts
type FolderCardProps = {
  binder: Binder
  onClick: () => void
  onMenu?: () => void                  // ⋮ → drawer (rename, set main, delete)
}
```
Cover image (sprite of `coverPokemonId` or gradient fallback), name, region badge, progress bar (`primary-container` fill), `ownedSlots / totalSlots`, "ÚLTIMA ED. há X". Optional "DECK PRINCIPAL" chip when `isMain`.

**`CreateBinderModal`** (refactored) — `components/binder/create-modal.tsx`
Vaul drawer (mobile) / Radix dialog (desktop). Fields:
1. Binder Name (input, optional, default = `Pokédex – {Region}`).
2. Region picker — segmented control: `National | Kanto | Johto | Hoenn | Sinnoh | Unova | Kalos | Alola | Galar | Paldea`.
3. Cover Pokémon — optional picker, search by name within selected region.
4. Grid Configuration — segmented `3×3 | 4×3 | 2×2 | 4×4` (default 3×3).

Primary CTA "CREATE BINDER", secondary "Discard". Footer note: "Configurações podem ser editadas depois exceto Region (locked após criar)."

**`BinderSlot`** (new) — replaces parts of existing `pokemon-card.tsx`/`silhouette-canvas.tsx`
```ts
type BinderSlotProps = {
  pokemonId: number
  owned: boolean
  onToggle: () => void
}
```
- `owned: false` → silhouette (reuses `silhouette-canvas`)
- `owned: true` → official artwork sprite + name in label-caps
- Tap → toggle owned (optimistic)
- Long-press → context menu (V2: change art, mark duplicate)

**`BinderPaginator`** (refactored from `binder-page.tsx`) — touch-swipe paginated grid with arrow controls. Page header shows `Página X de Y · {region}`. Math lives in `lib/binder-math.ts`.

### Play

**`PlayLandingCard`** (new) — used by `play-landing.tsx`
- If `activeMatch` exists → "CONTINUE BATTLE" card with snapshot (opponent name, "iniciada há X", prize cards remaining) + big "CONTINUE" button + secondary "New Battle (descarta atual)".
- Else → just "NEW BATTLE" big button.

**`GameTable`, `FieldSide`, `SlotPopover`, `CoinModal`, `GameHistory`** (restyle of existing components)
- `FieldSide` keeps `rotate-180` on side A (tabletop play).
- `SlotPopover` stays as bottom sheet, restyled to match `card-options.png`: large HP, +/- damage, energy chips row, status grid 3×2, "Usar Habilidade" / "Limpar Danos" CTAs.
- `GameHistory` adopts `history-log.png` layout: single timeline with `OPPONENT`/`YOU` chips, Quick Stats with real Prize Cards count, Accuracy/Tempo as disabled placeholders ("Em breve" tooltip).
- `CoinModal` keeps portal + side-based rotation.

**`MatchSettingsDrawer`** (new) — opens from ⚙️ in `/play/match` header. Items: Reset slot, Swap sides, Toggle history visibility, **End Match** (destructive, confirm).

### Settings (`/settings`)

V1 minimal: header "Settings", a "Data" section with destructive "Clear all data" button (binders + match + settings) gated behind a confirm dialog with "I'm sure" checkbox. App version in footer.

## Data

### Static — `lib/pokemon.ts`

```ts
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
export type Pokemon = { id: number; name: string; types: string[]; generation: number }

export function getPokemonByRegion(region: RegionKey): Pokemon[]
export function getPokemon(id: number): Pokemon | undefined
export function getSpriteUrl(id: number, kind?: 'official' | 'sprite'): string
```

Sprite URL pattern:
- `official` → `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`
- `sprite` → `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`

### Region slot counts

| Region | Slots | Pokemon ID range |
|---|---|---|
| Kanto | 151 | 1–151 |
| Johto | 100 | 152–251 |
| Hoenn | 135 | 252–386 |
| Sinnoh | 107 | 387–493 |
| Unova | 156 | 494–649 |
| Kalos | 72 | 650–721 |
| Alola | 88 | 722–809 |
| Galar | 96 | 810–905 |
| Paldea | 120 | 906–1025 |
| National | 1025 | 1–1025 |

### Stores (Zustand + persist)

```ts
// stores/binder-store.ts
type Binder = {
  id: string                     // nanoid
  name: string
  region: RegionKey
  grid: '3x3' | '4x3' | '2x2' | '4x4'
  coverPokemonId?: number
  isMain?: boolean
  ownedSlots: number[]           // pokemon IDs
  createdAt: number
  updatedAt: number
}

type BinderStore = {
  binders: Binder[]
  createBinder(input: Omit<Binder, 'id' | 'ownedSlots' | 'createdAt' | 'updatedAt'>): string
  deleteBinder(id: string): void
  renameBinder(id: string, name: string): void
  setMain(id: string): void
  toggleSlotOwned(id: string, pokemonId: number): void
  setCover(id: string, pokemonId: number | undefined): void
}
```

```ts
// stores/match-store.ts
type EnergyType = 'Fire'|'Water'|'Grass'|'Electric'|'Psychic'|'Fighting'|'Darkness'|'Metal'|'Fairy'|'Dragon'|'Colorless'
type Condition = 'confused'|'paralyzed'|'asleep'|'poisoned'|'burned'

type Slot = {
  pokemonName?: string
  pokemonId?: number
  archetype?: EnergyType
  hp: number
  damage: number
  energies: EnergyType[]
  conditions: Set<Condition>
  abilityUsed: boolean
}

type Side = {
  slots: [Slot, Slot, Slot, Slot, Slot, Slot]   // index 0 = active, 1-5 = bench
  prizeRemaining: number                         // 6 → 0
  historyVisible: boolean
}

type Action = {
  id: string
  ts: number
  side: 'a' | 'b'
  kind: 'damage' | 'heal' | 'energy-attach' | 'energy-detach'
       | 'condition-set' | 'condition-clear' | 'ability-used'
       | 'retreat' | 'ko' | 'attack-named' | 'custom-note'
  payload: Record<string, unknown>
  summary: string
}

type Match = {
  id: string
  startedAt: number
  opponentName?: string
  a: Side
  b: Side
  history: Action[]
}

type MatchStore = {
  activeMatch: Match | null
  startMatch(setup: { opponentName?: string }): void
  endMatch(): void
  applyAction(input: Omit<Action, 'id' | 'ts'>): void
  toggleHistoryVisible(side: 'a' | 'b'): void
}
```

```ts
// stores/settings-store.ts
type SettingsStore = {
  clearAllData(): void   // wipes binder + match + settings
}
```

### Persistence

| Store | Storage key | Notes |
|---|---|---|
| binder | `pokemon-tools/binders/v1` | — |
| match | `pokemon-tools/match/v1` | — |
| settings | `pokemon-tools/settings/v1` | — |

- `Set<Condition>` → serialized via custom `replacer/reviver` (`Array.from` ↔ `new Set`).
- `version: 1` on all stores; `migrate` callback ready for V2.
- **No migration from current stores** (`store.ts`, `game-store.ts`, `settings-store.ts`). Fresh start. App is under active remodel; existing local data is acceptable to lose.

### Page → store map

| Route | Reads | Writes |
|---|---|---|
| `/` | `match-store.activeMatch` — when present, the Battle Assistant `TacticalCard` shows a small "IN PROGRESS" pill chip in the corner | — |
| `/binder` | `binder-store.binders` | `createBinder`, `deleteBinder`, `setMain` |
| `/binder/:id` | `binders.find(id)` + `getPokemonByRegion(region)` | `toggleSlotOwned`, `renameBinder`, `setCover` |
| `/play` | `activeMatch` | — |
| `/play/new` | — | `startMatch` (then navigate `/play/match`) |
| `/play/match` | `activeMatch` | `applyAction`, `toggleHistoryVisible`, `endMatch` |
| `/settings` | — | `clearAllData` |

## Visual identity

Source of truth: `DESIGN.md` at repo root.

**Token plumbing:**
- Frontmatter Material 3 tokens become CSS variables in `index.css` under `:root` and `[data-theme="dark"]` (single dark theme for V1).
- Tailwind v4 `@theme` directive consumes these vars so utility classes (`bg-surface`, `text-primary`, `border-outline-variant`) work natively.
- Tokens override Tailwind defaults (no use of stock `bg-zinc-900` etc).

**Frontmatter wins over prose** when values disagree (`background: #111318` from frontmatter, not `#0A0C10` from prose).

**Font:** Replace `@fontsource-variable/geist` with `@fontsource-variable/inter`. Update `<body>` font stack to Inter.

**Iconography:** `lucide-react` (already installed). Use `strokeWidth={2}`, never filled.

## Edge cases

### Sprites
- CDN failure → `onError` swaps to client-side `silhouette-canvas`. Slot stays interactive.
- All sprites use `loading="lazy"`. No global preload.

### Binder
- Region is **always locked** after creation (changing it changes the entire slot set). Editable: `name`, `cover`, `isMain`.
- Deleting a binder with owned slots → confirm dialog showing the owned count.
- Deleting the main binder → no auto-promotion of another binder.
- Invalid `coverPokemonId` (e.g., set then region changed in a hypothetical future) → fallback to first owned slot, then to gradient.
- Optimistic `toggleSlotOwned` is safe: persist is synchronous to localStorage.

### Match
- `startMatch` while `activeMatch` exists → confirm dialog before overwriting.
- Same confirm on the "New Battle" button in `/play` when there's an active match.
- Reload mid-action: state persisted on every `applyAction`.
- Empty bench slots are valid (`+ Add Pokemon` placeholder).
- Side A `rotate-180`: all modals (`SlotPopover`, `CoinModal`, `MatchSettingsDrawer`) use `createPortal(jsx, document.body)` to escape the transform context. Coin modal rotates per opening side.
- **Undo is not in V1.** Action log is append-only.

### Settings
- `clearAllData`: dialog with warning + "I'm sure" checkbox before destructive button enables. After clear: `window.location.assign('/')` (full page navigation, guarantees fresh in-memory state across all stores).

### Storage
- Quota exceeded: silent in-memory fallback + `console.warn`. No toast in V1.
- Multi-tab: persist does not sync between tabs. Documented limitation.

## Testing

### Stack
Add `vitest` + `@testing-library/react` + `jsdom`. Scripts:
- `"test": "vitest"`
- `"test:ci": "vitest run"`

### Required unit tests

```
lib/pokemon.test.ts
  - getPokemonByRegion('kanto') → 151 entries (id 1-151)
  - getPokemonByRegion('johto') → 100 entries (id 152-251)
  - getPokemonByRegion('national') → 1025 entries
  - getPokemon(25) → Pikachu
  - getSpriteUrl(1, 'official') → expected URL

lib/binder-math.test.ts
  - 3x3 with 151 slots → 17 pages (16 full + 1 with 7)
  - slotIndexToPage/position round-trip with pageToSlotIndex

stores/match-store.test.ts
  - applyAction({kind:'damage', payload:{amount:30}}) updates slot.damage
  - applyAction appends Action to history with correct summary
  - startMatch overwrites activeMatch
  - endMatch nulls activeMatch
  - persist round-trips Set<Condition> correctly

stores/binder-store.test.ts
  - createBinder returns id and adds entry
  - toggleSlotOwned adds/removes pokemonId
  - setMain enforces single main
```

### Type checking as a gate
`npm run typecheck` (already in `package.json`). Run in CI/pre-commit.

### Not tested in V1
Visual components, pages, routing — covered manually.

### Manual verification checklist (pre-merge)

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

## Implementation order (preview for plan phase)

The plan-writing skill will detail this. High-level sequence aligned with the "layered" approach (option 1):

1. **Tokens & shell** — wire `DESIGN.md` frontmatter into `index.css` + Tailwind theme; install Inter; add `Header` component.
2. **Routing & rename** — package.json rename, new routes, delete tab-bar, scaffold new page files.
3. **Data layer** — `lib/pokemon.ts`, region helpers, sprite URLs, unit tests.
4. **Stores rewrite** — three new persisted stores in `stores/`, unit tests.
5. **Binder feature** — list page, create modal, detail page, slot, paginator, FolderCard restyle.
6. **Play feature** — landing page, restyle game-table/field-side/slot-popover/coin-modal/history, MatchSettingsDrawer, persistence verification.
7. **Index & Settings** — TacticalCard, StatusPanel, SettingsPage with clearAllData.
8. **Cleanup** — delete `pokemon-data.ts`, `tab-bar.tsx`, old store files, old `app/` components folder.
9. **Verification** — full manual checklist.

## Open questions

None at this stage. All scope decisions captured during brainstorming and approved by user.

## References

- `DESIGN.md` — visual tokens and component guidelines
- `prototypes/` — `index.png`, `binder-list.png`, `create-binder.png`, `card-options.png`, `history-log.png`
- `docs/ideas/future-tools.md` — V2+ tool ideas (Pull Tracker, Trade Log, Wishlist, Damage Calculator, Deck Builder, Coin Flip standalone)
