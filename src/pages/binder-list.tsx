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
