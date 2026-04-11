# Player Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Jogar" (Play) tab to the Pokédex TCG app with modular player tools: damage board, coin flipper, and energy generator.

**Architecture:** New Zustand store (`useGameStore`) for game state, separate from existing `useBinderStore`. Tab bar layout wraps all routes. New `/jogar` route renders either GameSetup or GameTable based on `active` state. Each game tool (board, coins, energy) is a self-contained component toggled by modules config.

**Tech Stack:** React 18, TypeScript, Zustand (persist), React Router v6, Tailwind CSS v4, shadcn/ui (Drawer, Switch, Button), Vaul, Lucide icons, nanoid.

**Spec:** `docs/superpowers/specs/2026-04-11-player-tools-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `src/game-store.ts` | Zustand store for game state (format, modules, board, energy, coins) |
| `src/game-data.ts` | Energy type constants, colors, labels, format defaults |
| `src/components/app/tab-bar.tsx` | Layout component with bottom tabs (mobile) / top nav (desktop) |
| `src/pages/play.tsx` | `/jogar` page — renders GameSetup or GameTable |
| `src/components/app/game-setup.tsx` | Pre-game configuration: format, modules, energy selection |
| `src/components/app/game-table.tsx` | Active game table: field, floating coin button, energy indicators |
| `src/components/app/field-side.tsx` | One side of the field (active + bench slots) |
| `src/components/app/board-slot.tsx` | Single card-shaped slot showing damage + energies |
| `src/components/app/slot-popover.tsx` | Popover/drawer for interacting with a slot (damage ±, energy, move) |
| `src/components/app/coin-modal.tsx` | Bottom sheet for flipping coins with animation |
| `src/components/app/energy-indicator.tsx` | Floating indicator showing next energy to generate |

### Modified Files
| File | Change |
|---|---|
| `src/App.tsx` | Add TabBar layout, new routes `/colecao`, `/colecao/:id`, `/jogar`, redirect `/` → `/colecao` |
| `src/pages/home.tsx` | Remove top-level header (moved to TabBar), keep content |
| `src/index.css` | Add coin flip animation keyframes |

---

## Tasks

### Task 1: Game Data Constants

**Files:**
- Create: `src/game-data.ts`

- [ ] **Step 1: Create the energy types and format constants file**

```typescript
// src/game-data.ts

export const ENERGY_TYPES = [
  'grass', 'fire', 'water', 'lightning',
  'psychic', 'fighting', 'darkness', 'metal',
] as const

export type EnergyType = (typeof ENERGY_TYPES)[number]

export type GameFormat = 'standard' | 'pocket'

export interface GameModules {
  coins: boolean
  energy: boolean
  board: boolean
}

export interface BoardSlot {
  id: string
  position: 'active' | 'bench'
  damage: number
  energies: EnergyType[]
}

export interface FieldSide {
  slots: BoardSlot[]
}

export const ENERGY_LABEL: Record<EnergyType, string> = {
  grass: 'Planta',
  fire: 'Fogo',
  water: 'Água',
  lightning: 'Elétrica',
  psychic: 'Psíquica',
  fighting: 'Lutador',
  darkness: 'Sombrio',
  metal: 'Metal',
}

export const ENERGY_EMOJI: Record<EnergyType, string> = {
  grass: '🌿',
  fire: '🔥',
  water: '💧',
  lightning: '⚡',
  psychic: '🔮',
  fighting: '👊',
  darkness: '🌑',
  metal: '⚙️',
}

export const ENERGY_COLOR: Record<EnergyType, string> = {
  grass: '#4ade80',
  fire: '#ef4444',
  water: '#60a5fa',
  lightning: '#facc15',
  psychic: '#c084fc',
  fighting: '#f97316',
  darkness: '#6b7280',
  metal: '#94a3b8',
}

export const FORMAT_DEFAULTS: Record<GameFormat, {
  benchSize: number
  modules: GameModules
}> = {
  standard: {
    benchSize: 5,
    modules: { coins: true, energy: false, board: true },
  },
  pocket: {
    benchSize: 3,
    modules: { coins: true, energy: true, board: true },
  },
}

export const MAX_ENERGY_TYPES = 3 // Pocket allows max 3 types
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/well/Projects/pokedex-tcg && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/game-data.ts
git commit -m "feat: add game data constants for energy types and format defaults"
```

---

### Task 2: Game Store

**Files:**
- Create: `src/game-store.ts`
- Reference: `src/game-data.ts`, `src/store.ts` (pattern)

- [ ] **Step 1: Create the game store with all actions**

```typescript
// src/game-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type {
  EnergyType, GameFormat, GameModules, BoardSlot, FieldSide,
} from '@/game-data'
import { FORMAT_DEFAULTS } from '@/game-data'

interface GameState {
  format: GameFormat
  modules: GameModules
  energyPool: EnergyType[]
  active: boolean
  turn: number
  myField: FieldSide
  opponentField: FieldSide
  currentEnergy: EnergyType | null
  opponentEnergy: EnergyType | null

  setFormat: (format: GameFormat) => void
  setModules: (modules: GameModules) => void
  setEnergyPool: (pool: EnergyType[]) => void
  startGame: () => void
  endGame: () => void
  nextTurn: () => void
  generateEnergy: (side: 'my' | 'opponent') => void

  addDamage: (side: 'my' | 'opponent', slotId: string, amount: number) => void
  clearDamage: (side: 'my' | 'opponent', slotId: string) => void
  attachEnergy: (side: 'my' | 'opponent', slotId: string, energy: EnergyType) => void
  removeEnergy: (side: 'my' | 'opponent', slotId: string, index: number) => void
  addSlot: (side: 'my' | 'opponent') => void
  removeSlot: (side: 'my' | 'opponent', slotId: string) => void
  swapToActive: (side: 'my' | 'opponent', slotId: string) => void
  reorderSlots: (side: 'my' | 'opponent', fromIndex: number, toIndex: number) => void
}

function createSlots(benchSize: number): BoardSlot[] {
  return [
    { id: nanoid(), position: 'active', damage: 0, energies: [] },
    ...Array.from({ length: benchSize }, () => ({
      id: nanoid(),
      position: 'bench' as const,
      damage: 0,
      energies: [],
    })),
  ]
}

function getField(state: GameState, side: 'my' | 'opponent'): FieldSide {
  return side === 'my' ? state.myField : state.opponentField
}

function fieldKey(side: 'my' | 'opponent'): 'myField' | 'opponentField' {
  return side === 'my' ? 'myField' : 'opponentField'
}

function updateSlots(
  field: FieldSide,
  updater: (slots: BoardSlot[]) => BoardSlot[]
): FieldSide {
  return { slots: updater(field.slots) }
}

const initialModules: GameModules = { coins: true, energy: false, board: true }

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      format: 'standard',
      modules: initialModules,
      energyPool: [],
      active: false,
      turn: 0,
      myField: { slots: [] },
      opponentField: { slots: [] },
      currentEnergy: null,
      opponentEnergy: null,

      setFormat: (format) => {
        const defaults = FORMAT_DEFAULTS[format]
        set({ format, modules: { ...defaults.modules } })
      },

      setModules: (modules) => set({ modules }),

      setEnergyPool: (pool) => set({ energyPool: pool }),

      startGame: () => {
        const { format } = get()
        const { benchSize } = FORMAT_DEFAULTS[format]
        set({
          active: true,
          turn: 1,
          myField: { slots: createSlots(benchSize) },
          opponentField: { slots: createSlots(benchSize) },
          currentEnergy: null,
          opponentEnergy: null,
        })
      },

      endGame: () =>
        set({
          active: false,
          turn: 0,
          myField: { slots: [] },
          opponentField: { slots: [] },
          currentEnergy: null,
          opponentEnergy: null,
        }),

      nextTurn: () =>
        set((s) => ({
          turn: s.turn + 1,
          currentEnergy: null,
          opponentEnergy: null,
        })),

      generateEnergy: (side) => {
        const { energyPool } = get()
        if (energyPool.length === 0) return
        const energy = energyPool[Math.floor(Math.random() * energyPool.length)]
        set(side === 'my' ? { currentEnergy: energy } : { opponentEnergy: energy })
      },

      addDamage: (side, slotId, amount) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) =>
              sl.id === slotId
                ? { ...sl, damage: Math.max(0, sl.damage + amount) }
                : sl
            )
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
            slots.map((sl) =>
              sl.id === slotId
                ? { ...sl, energies: [...sl.energies, energy] }
                : sl
            )
          ),
        })),

      removeEnergy: (side, slotId, index) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) =>
              sl.id === slotId
                ? { ...sl, energies: sl.energies.filter((_, i) => i !== index) }
                : sl
            )
          ),
        })),

      addSlot: (side) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) => [
            ...slots,
            { id: nanoid(), position: 'bench', damage: 0, energies: [] },
          ]),
        })),

      removeSlot: (side, slotId) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.filter((sl) => sl.id !== slotId)
          ),
        })),

      swapToActive: (side, slotId) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) => {
            const currentActive = slots.find((sl) => sl.position === 'active')
            return slots.map((sl) => {
              if (sl.id === slotId) return { ...sl, position: 'active' }
              if (sl.id === currentActive?.id) return { ...sl, position: 'bench' }
              return sl
            })
          }),
        })),

      reorderSlots: (side, fromIndex, toIndex) =>
        set((s) => {
          const field = getField(s, side)
          const newSlots = [...field.slots]
          const [moved] = newSlots.splice(fromIndex, 1)
          newSlots.splice(toIndex, 0, moved)
          return { [fieldKey(side)]: { slots: newSlots } }
        }),
    }),
    { name: 'pokedex-tcg-game' }
  )
)

export function flipCoins(count: number): boolean[] {
  return Array.from({ length: count }, () => Math.random() >= 0.5)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/well/Projects/pokedex-tcg && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/game-store.ts
git commit -m "feat: add game store with board, energy, and coin actions"
```

---

### Task 3: Tab Bar Layout Component

**Files:**
- Create: `src/components/app/tab-bar.tsx`

- [ ] **Step 1: Create the TabBar layout component**

```tsx
// src/components/app/tab-bar.tsx
import { NavLink, Outlet } from 'react-router-dom'
import { BookOpenIcon, GamepadIcon } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

const tabs = [
  { to: '/colecao', label: 'Coleção', icon: BookOpenIcon },
  { to: '/jogar', label: 'Jogar', icon: GamepadIcon },
]

export function TabBar() {
  const isMobile = useIsMobile()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop top nav */}
      {!isMobile && (
        <nav className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center h-14 px-4">
            <span className="font-black text-lg text-gray-900 mr-8">Pokédex TCG</span>
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`
                  }
                >
                  <tab.icon className="size-4" />
                  {tab.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Page content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Mobile bottom tab bar */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40">
          <div className="flex">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                    isActive
                      ? 'text-gray-900 font-bold'
                      : 'text-gray-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`mb-0.5 ${isActive ? 'border-t-2 border-gray-900 w-6 -mt-2 pt-1.5' : ''}`}>
                      <tab.icon className="size-5" />
                    </div>
                    <span>{tab.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/well/Projects/pokedex-tcg && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/app/tab-bar.tsx
git commit -m "feat: add TabBar layout with mobile bottom tabs and desktop top nav"
```

---

### Task 4: Update Routes and Home Page

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/home.tsx`
- Create: `src/pages/play.tsx` (placeholder)

- [ ] **Step 1: Create placeholder Play page**

```tsx
// src/pages/play.tsx
export function Play() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Jogar — em construção</p>
    </div>
  )
}
```

- [ ] **Step 2: Update App.tsx with TabBar layout and new routes**

Replace the entire content of `src/App.tsx`:

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom'
import { useBinderStore } from '@/store'
import { Home } from '@/pages/home'
import { BinderView } from '@/pages/binder'
import { Play } from '@/pages/play'
import { TabBar } from '@/components/app/tab-bar'

function BinderRoute() {
  const { id } = useParams<{ id: string }>()
  const folder = useBinderStore((s) => s.folders.find((f) => f.id === id))
  if (!folder) return <Navigate to="/colecao" replace />
  return <BinderView folder={folder} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<TabBar />}>
          <Route path="/colecao" element={<Home />} />
          <Route path="/colecao/:id" element={<BinderRoute />} />
          <Route path="/jogar" element={<Play />} />
        </Route>
        <Route path="/" element={<Navigate to="/colecao" replace />} />
        <Route path="/binders/:id" element={<Navigate to="/colecao" replace />} />
        <Route path="*" element={<Navigate to="/colecao" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Update Home page to remove duplicate header (title/logo now in TabBar on desktop)**

In `src/pages/home.tsx`, the header stays as-is for now — it still provides the menu and "Novo" button. On desktop, the TabBar shows the logo and tabs above, and the Home header shows folder count and actions. This works without changes because the TabBar doesn't duplicate the folder-specific controls.

No code change needed for home.tsx in this step.

- [ ] **Step 4: Add bottom padding to pages for mobile tab bar**

In `src/pages/home.tsx`, add bottom padding so content doesn't hide behind the mobile tab bar. Change the outermost `<div>`:

Find: `<div className="min-h-screen bg-gray-50">`
Replace: `<div className="min-h-screen bg-gray-50 pb-16 md:pb-0">`

- [ ] **Step 5: Verify the app runs**

Run: `cd /Users/well/Projects/pokedex-tcg && npm run dev`
Expected: App starts. Navigate to `http://localhost:5173`. Should see tab bar, `/colecao` shows existing home page, `/jogar` shows placeholder.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/pages/play.tsx src/pages/home.tsx
git commit -m "feat: add tab bar navigation with /colecao and /jogar routes"
```

---

### Task 5: Game Setup Page

**Files:**
- Modify: `src/pages/play.tsx`
- Create: `src/components/app/game-setup.tsx`

- [ ] **Step 1: Create the GameSetup component**

```tsx
// src/components/app/game-setup.tsx
import { useGameStore } from '@/game-store'
import {
  ENERGY_TYPES, ENERGY_LABEL, ENERGY_EMOJI, ENERGY_COLOR,
  FORMAT_DEFAULTS, MAX_ENERGY_TYPES,
  type EnergyType, type GameFormat,
} from '@/game-data'
import { Switch } from '@/components/ui/switch'

export function GameSetup() {
  const format = useGameStore((s) => s.format)
  const modules = useGameStore((s) => s.modules)
  const energyPool = useGameStore((s) => s.energyPool)
  const setFormat = useGameStore((s) => s.setFormat)
  const setModules = useGameStore((s) => s.setModules)
  const setEnergyPool = useGameStore((s) => s.setEnergyPool)
  const startGame = useGameStore((s) => s.startGame)

  function handleFormatChange(f: GameFormat) {
    setFormat(f)
    if (f === 'standard') setEnergyPool([])
  }

  function toggleEnergy(type: EnergyType) {
    if (energyPool.includes(type)) {
      setEnergyPool(energyPool.filter((e) => e !== type))
    } else if (energyPool.length < MAX_ENERGY_TYPES) {
      setEnergyPool([...energyPool, type])
    }
  }

  const canStart =
    !modules.energy || energyPool.length > 0

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Format selector */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Formato</p>
        <div className="flex gap-2">
          {(['standard', 'pocket'] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFormatChange(f)}
              className={`flex-1 p-3 rounded-xl text-center transition-colors border-2 ${
                format === f
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="font-bold text-sm">{f === 'standard' ? 'Standard' : 'Pocket'}</div>
              <div className="text-xs mt-0.5 opacity-70">
                1 ativo + {FORMAT_DEFAULTS[f].benchSize} banco
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Module toggles */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Módulos</p>
        <div className="space-y-2">
          {([
            { key: 'coins' as const, label: '🪙 Moedas', desc: 'Jogar 1 ou mais moedas' },
            { key: 'energy' as const, label: '⚡ Gerador de Energia', desc: '1 energia/turno (Pocket)' },
            { key: 'board' as const, label: '🎯 Tabuleiro de Dano', desc: 'Contadores por slot' },
          ]).map((mod) => {
            const isEnergyDisabled = mod.key === 'energy' && format === 'standard'
            return (
              <div
                key={mod.key}
                className={`flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 ${
                  isEnergyDisabled ? 'opacity-40' : ''
                }`}
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">{mod.label}</div>
                  <div className="text-xs text-gray-400">{mod.desc}</div>
                </div>
                <Switch
                  checked={modules[mod.key]}
                  disabled={isEnergyDisabled}
                  onCheckedChange={(checked: boolean) =>
                    setModules({ ...modules, [mod.key]: checked })
                  }
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Energy selection */}
      {modules.energy && format === 'pocket' && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Energias ({energyPool.length}/{MAX_ENERGY_TYPES})
          </p>
          <div className="flex flex-wrap gap-2">
            {ENERGY_TYPES.map((type) => {
              const selected = energyPool.includes(type)
              const disabled = !selected && energyPool.length >= MAX_ENERGY_TYPES
              return (
                <button
                  key={type}
                  onClick={() => toggleEnergy(type)}
                  disabled={disabled}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all border-2 ${
                    selected
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : disabled
                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span>{ENERGY_EMOJI[type]}</span>
                  <span>{ENERGY_LABEL[type]}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Start button */}
      <button
        onClick={startGame}
        disabled={!canStart}
        className="w-full py-3.5 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-800 transition-colors active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
      >
        Iniciar Partida
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Update Play page to show setup or table**

Replace `src/pages/play.tsx`:

```tsx
// src/pages/play.tsx
import { useGameStore } from '@/game-store'
import { GameSetup } from '@/components/app/game-setup'

export function Play() {
  const active = useGameStore((s) => s.active)

  if (!active) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <header className="bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
          <div className="max-w-md mx-auto">
            <h1 className="font-black text-xl text-gray-900">Jogar</h1>
            <p className="text-xs text-gray-400">Configure sua partida</p>
          </div>
        </header>
        <GameSetup />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-16 md:pb-0">
      <p className="text-gray-400">Mesa ativa — em construção</p>
    </div>
  )
}
```

- [ ] **Step 3: Verify the app runs and setup works**

Run: `cd /Users/well/Projects/pokedex-tcg && npm run dev`
Expected: Navigate to `/jogar`, see format selector, module toggles, energy selection (Pocket only). Click "Iniciar Partida" changes to placeholder table view.

- [ ] **Step 4: Commit**

```bash
git add src/components/app/game-setup.tsx src/pages/play.tsx
git commit -m "feat: add game setup page with format, modules, and energy selection"
```

---

### Task 6: Board Slot Component

**Files:**
- Create: `src/components/app/board-slot.tsx`

- [ ] **Step 1: Create the BoardSlot component**

```tsx
// src/components/app/board-slot.tsx
import type { BoardSlot as BoardSlotType } from '@/game-data'
import { ENERGY_EMOJI, ENERGY_COLOR } from '@/game-data'

interface BoardSlotProps {
  slot: BoardSlotType
  label: string
  variant: 'my' | 'opponent'
  onClick: () => void
}

export function BoardSlot({ slot, label, variant, onClick }: BoardSlotProps) {
  const isActive = slot.position === 'active'
  const borderColor = variant === 'my' ? 'border-green-400' : 'border-red-400'
  const labelColor = variant === 'my' ? 'text-green-400' : 'text-red-400'
  const damageColor = slot.damage > 0 ? 'text-amber-400' : 'text-gray-500'

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded transition-colors ${
        isActive
          ? `w-14 h-[76px] border-2 ${borderColor} bg-gray-900`
          : 'w-[52px] h-[70px] border border-gray-700 bg-gray-900'
      }`}
    >
      <span className={`text-[8px] leading-none ${isActive ? labelColor : 'text-gray-500'}`}>
        {label}
      </span>
      <span className={`text-sm font-bold ${damageColor} mt-0.5`}>
        {slot.damage}
      </span>
      {slot.energies.length > 0 && (
        <div className="flex gap-px mt-1 flex-wrap justify-center max-w-full px-0.5">
          {slot.energies.map((e, i) => (
            <span
              key={i}
              className="w-[10px] h-[10px] rounded-full border flex items-center justify-center text-[6px] leading-none"
              style={{ borderColor: ENERGY_COLOR[e], backgroundColor: `${ENERGY_COLOR[e]}20` }}
            >
              {ENERGY_EMOJI[e]}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/well/Projects/pokedex-tcg && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/app/board-slot.tsx
git commit -m "feat: add BoardSlot component with damage and energy display"
```

---

### Task 7: Slot Popover Component

**Files:**
- Create: `src/components/app/slot-popover.tsx`

- [ ] **Step 1: Create the SlotPopover component**

```tsx
// src/components/app/slot-popover.tsx
import { useGameStore } from '@/game-store'
import {
  ENERGY_TYPES, ENERGY_EMOJI, ENERGY_LABEL, ENERGY_COLOR,
  type BoardSlot, type EnergyType,
} from '@/game-data'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer'

interface SlotPopoverProps {
  slot: BoardSlot
  side: 'my' | 'opponent'
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SlotPopover({ slot, side, label, open, onOpenChange }: SlotPopoverProps) {
  const addDamage = useGameStore((s) => s.addDamage)
  const clearDamage = useGameStore((s) => s.clearDamage)
  const attachEnergy = useGameStore((s) => s.attachEnergy)
  const removeEnergy = useGameStore((s) => s.removeEnergy)
  const swapToActive = useGameStore((s) => s.swapToActive)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{label}</DrawerTitle>
          <DrawerDescription>
            {side === 'my' ? 'Seu campo' : 'Campo adversário'}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-4">
          {/* Damage counter */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Dano</p>
            <div className="flex items-center justify-center gap-2">
              {[-20, -10].map((amt) => (
                <button
                  key={amt}
                  onClick={() => addDamage(side, slot.id, amt)}
                  className="w-12 h-9 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {amt}
                </button>
              ))}
              <span className="text-2xl font-black text-red-500 w-16 text-center">
                {slot.damage}
              </span>
              {[10, 20].map((amt) => (
                <button
                  key={amt}
                  onClick={() => addDamage(side, slot.id, amt)}
                  className="w-12 h-9 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Attached energies */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Energias atreladas</p>
            <div className="flex flex-wrap gap-2 items-center">
              {slot.energies.map((e, i) => (
                <button
                  key={i}
                  onClick={() => removeEnergy(side, slot.id, i)}
                  className="w-7 h-7 rounded-full border flex items-center justify-center text-sm hover:opacity-60 transition-opacity"
                  style={{ borderColor: ENERGY_COLOR[e], backgroundColor: `${ENERGY_COLOR[e]}20` }}
                  title={`Remover ${ENERGY_LABEL[e]}`}
                >
                  {ENERGY_EMOJI[e]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {ENERGY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => { attachEnergy(side, slot.id, type); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <span>{ENERGY_EMOJI[type]}</span>
                  <span>{ENERGY_LABEL[type]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => { clearDamage(side, slot.id); }}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Limpar dano
            </button>
            {slot.position === 'bench' && (
              <button
                onClick={() => { swapToActive(side, slot.id); onOpenChange(false); }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Mover p/ Ativo
              </button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/well/Projects/pokedex-tcg && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/app/slot-popover.tsx
git commit -m "feat: add SlotPopover with damage counter, energy, and move actions"
```

---

### Task 8: Field Side Component

**Files:**
- Create: `src/components/app/field-side.tsx`

- [ ] **Step 1: Create the FieldSide component**

```tsx
// src/components/app/field-side.tsx
import { useState } from 'react'
import { useGameStore } from '@/game-store'
import type { FieldSide as FieldSideType } from '@/game-data'
import { BoardSlot } from '@/components/app/board-slot'
import { SlotPopover } from '@/components/app/slot-popover'
import { PlusIcon, MinusIcon } from 'lucide-react'

interface FieldSideProps {
  field: FieldSideType
  side: 'my' | 'opponent'
  label: string
}

export function FieldSide({ field, side, label }: FieldSideProps) {
  const addSlot = useGameStore((s) => s.addSlot)
  const removeSlot = useGameStore((s) => s.removeSlot)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const activeSlot = field.slots.find((s) => s.position === 'active')
  const benchSlots = field.slots.filter((s) => s.position === 'bench')
  const selectedSlot = field.slots.find((s) => s.id === selectedSlotId)

  const labelColor = side === 'my' ? 'text-green-500' : 'text-red-500'

  // For opponent, bench is on top, active below. For my side, active on top, bench below.
  const isOpponent = side === 'opponent'

  const lastBench = benchSlots[benchSlots.length - 1]

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center justify-between w-full px-2">
        <span className={`text-[10px] uppercase tracking-wider font-bold ${labelColor}`}>
          {label}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => addSlot(side)}
            className="text-green-500 bg-green-500/10 rounded px-1.5 py-0.5 text-[10px] hover:bg-green-500/20 transition-colors"
          >
            <PlusIcon className="size-3 inline" /> Slot
          </button>
          {lastBench && (
            <button
              onClick={() => removeSlot(side, lastBench.id)}
              className="text-red-500 bg-red-500/10 rounded px-1.5 py-0.5 text-[10px] hover:bg-red-500/20 transition-colors"
            >
              <MinusIcon className="size-3 inline" /> Slot
            </button>
          )}
        </div>
      </div>

      {isOpponent ? (
        <>
          {/* Bench first for opponent */}
          <div className="flex justify-center gap-1 flex-wrap">
            {benchSlots.map((slot, i) => (
              <BoardSlot
                key={slot.id}
                slot={slot}
                label={`B${i + 1}`}
                variant={side}
                onClick={() => setSelectedSlotId(slot.id)}
              />
            ))}
          </div>
          {/* Active below */}
          {activeSlot && (
            <BoardSlot
              slot={activeSlot}
              label="Ativo"
              variant={side}
              onClick={() => setSelectedSlotId(activeSlot.id)}
            />
          )}
        </>
      ) : (
        <>
          {/* Active first for my side */}
          {activeSlot && (
            <BoardSlot
              slot={activeSlot}
              label="Ativo"
              variant={side}
              onClick={() => setSelectedSlotId(activeSlot.id)}
            />
          )}
          {/* Bench below */}
          <div className="flex justify-center gap-1 flex-wrap">
            {benchSlots.map((slot, i) => (
              <BoardSlot
                key={slot.id}
                slot={slot}
                label={`B${i + 1}`}
                variant={side}
                onClick={() => setSelectedSlotId(slot.id)}
              />
            ))}
          </div>
        </>
      )}

      {selectedSlot && (
        <SlotPopover
          slot={selectedSlot}
          side={side}
          label={selectedSlot.position === 'active' ? 'Ativo' : `Banco`}
          open={!!selectedSlotId}
          onOpenChange={(open) => { if (!open) setSelectedSlotId(null) }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/well/Projects/pokedex-tcg && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/app/field-side.tsx
git commit -m "feat: add FieldSide component with active/bench layout and slot management"
```

---

### Task 9: Coin Modal with Animation

**Files:**
- Create: `src/components/app/coin-modal.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Add coin flip animation keyframes to index.css**

Append to `src/index.css` before the closing `}` of `@layer base`:

```css
@keyframes coin-flip {
  0% { transform: rotateY(0deg) translateY(0); }
  30% { transform: rotateY(540deg) translateY(-30px); }
  70% { transform: rotateY(1080deg) translateY(-10px); }
  100% { transform: rotateY(1440deg) translateY(0); }
}

.coin-flipping {
  animation: coin-flip 1s ease-in-out;
}
```

- [ ] **Step 2: Create the CoinModal component**

```tsx
// src/components/app/coin-modal.tsx
import { useState, useCallback } from 'react'
import { flipCoins } from '@/game-store'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer'
import { MinusIcon, PlusIcon } from 'lucide-react'

interface CoinModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CoinModal({ open, onOpenChange }: CoinModalProps) {
  const [count, setCount] = useState(1)
  const [results, setResults] = useState<boolean[] | null>(null)
  const [flipping, setFlipping] = useState(false)

  const handleFlip = useCallback(() => {
    setFlipping(true)
    setResults(null)
    setTimeout(() => {
      setResults(flipCoins(count))
      setFlipping(false)
    }, 1000)
  }, [count])

  const heads = results?.filter(Boolean).length ?? 0
  const tails = (results?.length ?? 0) - heads

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>🪙 Jogar Moedas</DrawerTitle>
          <DrawerDescription>Selecione a quantidade e jogue</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-4">
          {/* Quantity selector */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-gray-500">Quantidade:</span>
            <button
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <MinusIcon className="size-4" />
            </button>
            <span className="text-2xl font-bold w-8 text-center">{count}</span>
            <button
              onClick={() => setCount((c) => c + 1)}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>

          {/* Coin display */}
          <div className="flex justify-center gap-3 flex-wrap py-4">
            {Array.from({ length: count }, (_, i) => {
              const result = results?.[i]
              const isHeads = result === true
              return (
                <div
                  key={i}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-black shadow-lg ${
                    flipping ? 'coin-flipping' : ''
                  } ${
                    result == null
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black/40'
                      : isHeads
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black'
                        : 'bg-gradient-to-br from-gray-400 to-gray-600 text-white'
                  }`}
                  style={{ perspective: '600px' }}
                >
                  {result == null ? '?' : isHeads ? 'C' : 'K'}
                </div>
              )
            })}
          </div>

          {/* Results summary */}
          {results && (
            <div className="text-center text-sm bg-gray-50 rounded-xl py-2.5 px-4">
              <span className="text-green-600 font-semibold">{heads} Cara</span>
              {' · '}
              <span className="text-red-500 font-semibold">{tails} Coroa</span>
            </div>
          )}

          {/* Flip button */}
          <button
            onClick={handleFlip}
            disabled={flipping}
            className="w-full py-3 rounded-2xl bg-amber-500 text-black font-bold text-base hover:bg-amber-400 transition-colors active:scale-[0.98] disabled:opacity-50"
          >
            {results ? 'Jogar Novamente' : 'Jogar!'}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/well/Projects/pokedex-tcg && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/app/coin-modal.tsx src/index.css
git commit -m "feat: add CoinModal with quantity selector and flip animation"
```

---

### Task 10: Energy Indicator Component

**Files:**
- Create: `src/components/app/energy-indicator.tsx`

- [ ] **Step 1: Create the EnergyIndicator component**

```tsx
// src/components/app/energy-indicator.tsx
import { useGameStore } from '@/game-store'
import { ENERGY_EMOJI, ENERGY_LABEL, ENERGY_COLOR, type EnergyType } from '@/game-data'

interface EnergyIndicatorProps {
  side: 'my' | 'opponent'
}

export function EnergyIndicator({ side }: EnergyIndicatorProps) {
  const energy = useGameStore((s) =>
    side === 'my' ? s.currentEnergy : s.opponentEnergy
  )
  const generateEnergy = useGameStore((s) => s.generateEnergy)

  const positionClass = side === 'my'
    ? 'bottom-16 md:bottom-3 right-3'
    : 'top-12 left-3'

  if (!energy) {
    return (
      <button
        onClick={() => generateEnergy(side)}
        className={`absolute z-10 ${positionClass} flex items-center gap-1.5 bg-gray-900/90 border border-gray-700 rounded-lg px-2.5 py-1.5 hover:bg-gray-800/90 transition-colors`}
      >
        <span className="text-base">⚡</span>
        <span className="text-[10px] text-gray-400 leading-tight">
          Gerar
        </span>
      </button>
    )
  }

  return (
    <div
      className={`absolute z-10 ${positionClass} flex items-center gap-1.5 bg-gray-900/90 border border-gray-700 rounded-lg px-2.5 py-1.5`}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
        style={{
          background: `linear-gradient(135deg, ${ENERGY_COLOR[energy]}, ${ENERGY_COLOR[energy]}88)`,
          boxShadow: `0 0 8px ${ENERGY_COLOR[energy]}40`,
        }}
      >
        {ENERGY_EMOJI[energy]}
      </div>
      <div className="text-[10px] leading-tight">
        <div className="font-semibold" style={{ color: ENERGY_COLOR[energy] }}>
          {side === 'my' ? 'Próxima' : 'Próxima'}
        </div>
        <div className="text-gray-400">{ENERGY_LABEL[energy]}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/well/Projects/pokedex-tcg && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/app/energy-indicator.tsx
git commit -m "feat: add EnergyIndicator floating component with generate action"
```

---

### Task 11: Game Table (Main Assembly)

**Files:**
- Create: `src/components/app/game-table.tsx`
- Modify: `src/pages/play.tsx`

- [ ] **Step 1: Create the GameTable component**

```tsx
// src/components/app/game-table.tsx
import { useState } from 'react'
import { useGameStore } from '@/game-store'
import { FieldSide } from '@/components/app/field-side'
import { CoinModal } from '@/components/app/coin-modal'
import { EnergyIndicator } from '@/components/app/energy-indicator'
import { SettingsIcon, XIcon, SkipForwardIcon } from 'lucide-react'

export function GameTable() {
  const format = useGameStore((s) => s.format)
  const modules = useGameStore((s) => s.modules)
  const turn = useGameStore((s) => s.turn)
  const myField = useGameStore((s) => s.myField)
  const opponentField = useGameStore((s) => s.opponentField)
  const endGame = useGameStore((s) => s.endGame)
  const nextTurn = useGameStore((s) => s.nextTurn)

  const [coinOpen, setCoinOpen] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col z-30">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900/80">
        <div className="text-gray-400 text-xs">
          {format === 'standard' ? 'Standard' : 'Pocket'} · Turno {turn}
        </div>
        <div className="flex gap-1.5">
          {modules.energy && (
            <button
              onClick={nextTurn}
              className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            >
              <SkipForwardIcon className="size-3" />
              Próximo turno
            </button>
          )}
          <button
            onClick={() => setShowEndConfirm(true)}
            className="text-xs text-red-400 bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
          >
            <XIcon className="size-3" />
          </button>
        </div>
      </div>

      {/* Field area */}
      <div className="flex-1 flex flex-col justify-center items-center gap-1 relative overflow-hidden px-2">
        {/* Opponent field */}
        {modules.board && (
          <FieldSide field={opponentField} side="opponent" label="Adversário" />
        )}

        {/* VS divider */}
        {modules.board && (
          <div className="flex items-center gap-2 w-full max-w-xs">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-600 text-[10px]">VS</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>
        )}

        {/* My field */}
        {modules.board && (
          <FieldSide field={myField} side="my" label="Você" />
        )}

        {/* Energy indicators */}
        {modules.energy && <EnergyIndicator side="opponent" />}
        {modules.energy && <EnergyIndicator side="my" />}

        {/* Coin floating button */}
        {modules.coins && (
          <button
            onClick={() => setCoinOpen(true)}
            className="absolute bottom-16 md:bottom-3 left-3 z-10 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform"
          >
            🪙
          </button>
        )}
      </div>

      {/* Coin modal */}
      <CoinModal open={coinOpen} onOpenChange={setCoinOpen} />

      {/* End game confirm */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center space-y-4">
            <p className="font-bold text-gray-900">Encerrar partida?</p>
            <p className="text-sm text-gray-500">Todo o progresso será perdido.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={endGame}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Encerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update Play page to render GameTable when active**

In `src/pages/play.tsx`, replace the placeholder active state with GameTable:

```tsx
// src/pages/play.tsx
import { useGameStore } from '@/game-store'
import { GameSetup } from '@/components/app/game-setup'
import { GameTable } from '@/components/app/game-table'

export function Play() {
  const active = useGameStore((s) => s.active)

  if (active) {
    return <GameTable />
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <header className="bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
        <div className="max-w-md mx-auto">
          <h1 className="font-black text-xl text-gray-900">Jogar</h1>
          <p className="text-xs text-gray-400">Configure sua partida</p>
        </div>
      </header>
      <GameSetup />
    </div>
  )
}
```

- [ ] **Step 3: Verify the app runs end-to-end**

Run: `cd /Users/well/Projects/pokedex-tcg && npm run dev`

Test flow:
1. Go to `/jogar`
2. Select Pocket format
3. Toggle modules
4. Select 2-3 energy types
5. Click "Iniciar Partida"
6. See field with opponent (top) and you (bottom)
7. Tap a slot → popover with damage controls
8. Click 🪙 → coin modal opens
9. Click energy generate buttons
10. Click ✕ → end game confirm → back to setup

- [ ] **Step 4: Commit**

```bash
git add src/components/app/game-table.tsx src/pages/play.tsx
git commit -m "feat: add GameTable with field, coins, energy, and end game flow"
```

---

### Task 12: Final Polish and Binder Page Bottom Padding

**Files:**
- Modify: `src/pages/binder.tsx`

- [ ] **Step 1: Check if binder page needs bottom padding for tab bar**

Read `src/pages/binder.tsx` and check if the outermost container needs `pb-16 md:pb-0` to avoid content hiding behind the mobile tab bar. Add the class if needed.

- [ ] **Step 2: Verify full app runs correctly**

Run: `cd /Users/well/Projects/pokedex-tcg && npm run dev`

Test:
1. `/colecao` — existing binder list works, tab bar visible
2. `/colecao/:id` — binder view works, content not hidden behind tab bar
3. `/jogar` — setup → game → end game flow complete
4. Tab switching works on mobile and desktop
5. Game state persists on page refresh (localStorage)
6. Standard mode: no energy indicators, just coin button
7. Pocket mode: energy indicators + coin button

- [ ] **Step 3: Run typecheck**

Run: `cd /Users/well/Projects/pokedex-tcg && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add -u
git commit -m "feat: add bottom padding for tab bar on binder view"
```

---

## Summary

| Task | Component | Dependencies |
|------|-----------|-------------|
| 1 | Game Data Constants | — |
| 2 | Game Store | Task 1 |
| 3 | Tab Bar Layout | — |
| 4 | Routes + Home Update | Task 3 |
| 5 | Game Setup Page | Tasks 2, 4 |
| 6 | Board Slot | Task 1 |
| 7 | Slot Popover | Tasks 1, 2 |
| 8 | Field Side | Tasks 6, 7 |
| 9 | Coin Modal | Task 2 |
| 10 | Energy Indicator | Tasks 1, 2 |
| 11 | Game Table (Assembly) | Tasks 8, 9, 10 |
| 12 | Final Polish | Task 11 |

**Parallel tracks possible:**
- Track A: Tasks 1 → 2 → 5 (data → store → setup)
- Track B: Task 3 → 4 (tab bar → routes)
- Track C: Tasks 6, 7 → 8 (slot → popover → field)
- Track D: Task 9 (coin modal)
- Track E: Task 10 (energy indicator)
- Assembly: Task 11 (merges C, D, E) → Task 12 (polish)
