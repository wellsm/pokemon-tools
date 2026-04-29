import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemePreference = 'light' | 'dark' | 'system'

type SettingsState = {
  _v: 1
  themePreference: ThemePreference
  setThemePreference: (p: ThemePreference) => void
  clearAllData: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      _v: 1,
      themePreference: 'system',
      setThemePreference: (p) => set({ themePreference: p }),
      clearAllData: () => {
        localStorage.removeItem('pokemon-tools/binders/v1')
        localStorage.removeItem('pokemon-tools/match/v1')
        localStorage.removeItem('pokemon-tools/settings/v1')
        localStorage.removeItem('pokemon-tools/locale/v1')
        window.location.assign('/')
      },
    }),
    {
      name: 'pokemon-tools/settings/v1',
      version: 1,
    }
  )
)
