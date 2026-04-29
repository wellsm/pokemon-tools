import { useNavigate, useParams } from 'react-router-dom'
import { Settings as SettingsIcon } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { BinderPaginator } from '@/components/binder/binder-paginator'
import { useBinderStore } from '@/stores/binder-store'
import { useState } from 'react'
import { EditFolderDrawer } from '@/components/binder/edit-folder-drawer'
import { useT } from '@/lib/i18n/store'

export function BinderDetailPage() {
  const t = useT()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const binder = useBinderStore((s) => s.binders.find((b) => b.id === id))
  const [editing, setEditing] = useState(false)

  if (!binder) {
    return (
      <div className="min-h-screen">
        <Header back={{ to: '/binder' }} title={t.binderDetail.notFoundTitle} />
        <main className="px-4 mt-12 text-center text-muted-foreground">
          {t.binderDetail.notFoundBody}
          <button
            onClick={() => navigate('/binder')}
            className="block mx-auto mt-4 underline text-primary"
          >
            {t.binderDetail.backToBinders}
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header
        back={{ to: '/binder' }}
        title={binder.name}
        actions={
          <button
            onClick={() => setEditing(true)}
            aria-label={t.binderDetail.settingsLabel}
            className="p-2 rounded-md hover:bg-card"
          >
            <SettingsIcon strokeWidth={2} className="w-5 h-5 text-muted-foreground" />
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
