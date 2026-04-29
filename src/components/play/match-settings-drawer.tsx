import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { useNavigate } from 'react-router-dom'
import { useMatchStore } from '@/stores/match-store'

type Props = { open: boolean; onClose: () => void }

export function MatchSettingsDrawer({ open, onClose }: Props) {
  const navigate = useNavigate()
  const endMatch = useMatchStore((s) => s.endMatch)
  const toggleHistoryVisible = useMatchStore((s) => s.toggleHistoryVisible)

  function handleEnd() {
    const ok = window.confirm('End this match? History will be cleared.')
    if (!ok) return
    endMatch()
    onClose()
    navigate('/play')
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-surface-container-high border-outline-variant">
        <DrawerHeader>
          <DrawerTitle className="text-on-surface uppercase tracking-wider text-sm">
            Match Settings
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 flex flex-col gap-2">
          <button
            onClick={() => { toggleHistoryVisible('a'); toggleHistoryVisible('b') }}
            className="py-3 rounded-md bg-surface-container text-on-surface text-left px-4"
          >
            Toggle history visibility (both sides)
          </button>
          <button
            onClick={handleEnd}
            className="py-3 rounded-md bg-error-container text-on-error-container text-left px-4 font-bold"
          >
            End Match
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
