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
