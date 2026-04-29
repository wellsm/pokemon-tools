import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SettingsState = {
  /** placeholder for V1 — add settings here as needed */
  _v: 1
  clearAllData: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    () => ({
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
