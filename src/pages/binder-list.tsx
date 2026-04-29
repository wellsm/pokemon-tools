import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Folder, Plus } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { FolderCard } from '@/components/binder/folder-card'
import { CreateModal } from '@/components/binder/create-modal'
import { useBinderStore } from '@/stores/binder-store'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/store'

export function BinderListPage() {
  const t = useT()
  const navigate = useNavigate()
  const binders = useBinderStore((s) => s.binders)
  const [creating, setCreating] = useState(false)

  return (
    <div className="min-h-screen pb-24">
      <Header back={{ to: '/' }} title={t.binderList.headerTitle} />
      <main className="px-4 max-w-3xl mx-auto">
        <h1 className="mt-6 text-3xl font-extrabold text-foreground">{t.binderList.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.binderList.subtitle}
        </p>

        {binders.length === 0 ? (
          <div className="h-[80%] w-full absolute flex items-center mx-auto left-0 flex-col gap-2 justify-center">
            <div className="size-14 rounded-md bg-primary/20
                      flex items-center justify-center mb-4">
              <Folder strokeWidth={1.5} className="size-8 text-primary" />
            </div>
            <p className="text-muted-foreground">{t.binderList.empty}</p>
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

      <Button
        onClick={() => setCreating(true)}
        aria-label={t.binderList.fabLabel}
        className="fixed bottom-6 right-6 size-16 rounded-full bg-primary text-primary-foreground
                   shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus strokeWidth={2.5} className="size-8" />
      </Button>

      <CreateModal open={creating} onOpenChange={setCreating} />
    </div>
  )
}
