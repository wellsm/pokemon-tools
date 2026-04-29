import { useEffect, useState } from 'react'
import { useSettingsStore, type ThemePreference } from '@/stores/settings-store'

const SYSTEM_QUERY = '(prefers-color-scheme: dark)'

function resolve(preference: ThemePreference): 'light' | 'dark' {
  if (preference !== 'system') return preference
  return window.matchMedia(SYSTEM_QUERY).matches ? 'dark' : 'light'
}

function apply(preference: ThemePreference) {
  const next = resolve(preference)
  document.documentElement.classList.toggle('dark', next === 'dark')
  document.documentElement.style.colorScheme = next
}

export function useTheme() {
  const preference = useSettingsStore((s) => s.themePreference)

  useEffect(() => {
    apply(preference)
    if (preference !== 'system') return
    const mq = window.matchMedia(SYSTEM_QUERY)
    const onChange = () => apply('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])
}

export function useResolvedTheme(): 'light' | 'dark' {
  const preference = useSettingsStore((s) => s.themePreference)
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolve(preference))

  useEffect(() => {
    setResolved(resolve(preference))
    if (preference !== 'system') return
    const mq = window.matchMedia(SYSTEM_QUERY)
    const onChange = () => setResolved(resolve('system'))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  return resolved
}
