import { useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { useSettingsStore, type ThemePreference } from '@/stores/settings-store'
import { useI18nStore, useT, type Locale } from '@/lib/i18n/store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import packageJson from '../../package.json'

const THEME_OPTIONS: { value: ThemePreference; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
]

const LANGUAGE_OPTIONS: Locale[] = ['en', 'pt']

export function SettingsPage() {
  const t = useT()
  const locale = useI18nStore((s) => s.locale)
  const setLocale = useI18nStore((s) => s.setLocale)
  const clearAllData = useSettingsStore((s) => s.clearAllData)
  const themePreference = useSettingsStore((s) => s.themePreference)
  const setThemePreference = useSettingsStore((s) => s.setThemePreference)
  const [confirming, setConfirming] = useState(false)
  const [iAmSure, setIAmSure] = useState(false)

  return (
    <div className="min-h-screen">
      <Header back={{ to: '/' }} title={t.settings.title} />
      <main className="px-4 max-w-screen-md mx-auto mt-8 space-y-4">
        <section className="p-5 rounded-xl bg-card border border-border">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t.settings.theme.heading}
          </h2>
          <div role="radiogroup" aria-label={t.settings.theme.heading} className="mt-4 grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ value, icon: Icon }) => {
              const selected = themePreference === value
              return (
                <button
                  key={value}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setThemePreference(value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 transition-colors ${
                    selected
                      ? 'bg-primary text-primary-foreground border-border'
                      : 'bg-muted text-muted-foreground border-border hover:border-primary'
                  }`}
                >
                  <Icon strokeWidth={2} className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t.settings.theme[value]}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="p-5 rounded-xl bg-card border border-border">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t.settings.language.heading}
          </h2>
          <div role="radiogroup" aria-label={t.settings.language.heading} className="mt-4 grid grid-cols-2 gap-2">
            {LANGUAGE_OPTIONS.map((value) => {
              const selected = locale === value
              return (
                <button
                  key={value}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setLocale(value)}
                  className={`py-3 rounded-lg border-2 transition-colors text-sm font-bold uppercase tracking-wider ${
                    selected
                      ? 'bg-primary text-primary-foreground border-border'
                      : 'bg-muted text-muted-foreground border-border hover:border-primary'
                  }`}
                >
                  {t.settings.language[value]}
                </button>
              )
            })}
          </div>
        </section>

        <section className="p-5 rounded-xl bg-card border border-border">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t.settings.data.heading}
          </h2>
          <button
            onClick={() => setConfirming(true)}
            className="mt-4 w-full py-3 rounded-md bg-destructive text-destructive-foreground font-bold"
          >
            {t.settings.data.clear}
          </button>
        </section>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          v{packageJson.version}
        </p>
      </main>

      <AlertDialog
        open={confirming}
        onOpenChange={(open) => {
          setConfirming(open)
          if (!open) setIAmSure(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.settings.data.confirm.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.settings.data.confirm.body}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={iAmSure}
              onChange={(e) => setIAmSure(e.target.checked)}
            />
            {t.settings.data.confirm.checkbox}
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.settings.data.confirm.cancel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={!iAmSure}
              onClick={clearAllData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:pointer-events-none"
            >
              {t.settings.data.confirm.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
