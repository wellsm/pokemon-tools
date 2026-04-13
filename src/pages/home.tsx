import { useState, useRef, useEffect } from 'react'
import { useBinderStore, exportData, validateImport } from '@/store'
import { FolderCard } from '@/components/app/folder-card'
import { CreateModal } from '@/components/app/create-modal'
import { EllipsisVerticalIcon, DownloadIcon, UploadIcon } from 'lucide-react'

export function Home() {
  const folders = useBinderStore((s) => s.folders)
  const importFolders = useBinderStore((s) => s.importFolders)
  const [createOpen, setCreateOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        const valid = validateImport(parsed)
        if (!valid) {
          setImportError("Invalid file. Make sure it's a Pokédex TCG backup.")
          return
        }
        const mode = folders.length > 0
          ? confirm('Do you want to REPLACE all existing binders?\n\nOK = Replace\nCancel = Merge (add without deleting)')
            ? 'replace' as const
            : 'merge' as const
          : 'replace' as const
        importFolders(valid, mode)
      } catch {
        setImportError("Error reading file. Make sure it's valid JSON.")
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <header className="bg-primary px-4 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-black text-xl text-white leading-tight">Pokédex TCG</h1>
            <p className="text-xs text-white/70">{folders.length} binder{folders.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center justify-center size-10 rounded-2xl text-white/80 hover:bg-white/10 transition-colors active:scale-95"
                aria-label="Menu"
              >
                <EllipsisVerticalIcon className="size-5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-xl shadow-lg border border-border py-1 z-50">
                  <button
                    onClick={() => { exportData(); setMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <DownloadIcon className="size-4" />
                    Export data
                  </button>
                  <button
                    onClick={() => { fileRef.current?.click(); setMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <UploadIcon className="size-4" />
                    Import data
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-1.5 bg-white text-primary text-sm font-bold px-4 py-2.5 rounded-2xl hover:bg-white/90 transition-colors active:scale-95"
            >
              <span className="text-base leading-none">+</span> New
            </button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </header>

      {importError && (
        <div className="max-w-2xl mx-auto px-4 mt-3">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
            <span>{importError}</span>
            <button onClick={() => setImportError(null)} className="text-red-400 hover:text-red-600 font-bold ml-2">✕</button>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-5">
        {folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4 select-none">📒</div>
            <p className="font-bold text-gray-700 text-lg">No binders yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">Create one to start collecting</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl hover:bg-primary/90 transition-colors"
            >
              Create first binder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {folders
              .slice()
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((folder) => (
                <FolderCard key={folder.id} folder={folder} />
              ))}
          </div>
        )}
      </main>

      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} />}
    </div>
  )
}
