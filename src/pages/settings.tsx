import { useSettingsStore } from '@/settings-store'
import { Switch } from '@/components/ui/switch'
import { MoonIcon, SunIcon } from 'lucide-react'

export function Settings() {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <header className="bg-card border-b border-border px-4 py-4 shadow-sm">
        <div className="max-w-md mx-auto">
          <h1 className="font-black text-xl text-foreground">Configurações</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <MoonIcon className="size-5 text-muted-foreground" />
            ) : (
              <SunIcon className="size-5 text-muted-foreground" />
            )}
            <div>
              <div className="text-sm font-medium text-foreground">Tema escuro</div>
              <div className="text-xs text-muted-foreground">
                {theme === 'dark' ? 'Ativado' : 'Desativado'}
              </div>
            </div>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked: boolean) => setTheme(checked ? 'dark' : 'light')}
          />
        </div>
      </div>
    </div>
  )
}
