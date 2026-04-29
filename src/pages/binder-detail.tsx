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
      <EditFolderDrawer
        binder={binder}
        open={editing}
        onClose={() => setEditing(false)}
      />
    </div>
  )
}
