import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatchStore } from '@/stores/match-store'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { useT } from '@/lib/i18n/store'
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

type Props = { open: boolean; onClose: () => void }

export function MatchSettingsDrawer({ open, onClose }: Props) {
  const t = useT()
  const navigate = useNavigate()
  const endMatch = useMatchStore((s) => s.endMatch)
  const isMobile = useIsMobile()
  const [endOpen, setEndOpen] = useState(false)

  function confirmEnd() {
    endMatch()
    setEndOpen(false)
    onClose()
    navigate('/play')
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="bg-muted border-border" side={isMobile ? 'bottom' : 'right'}>
          <SheetHeader>
            <SheetTitle className="text-foreground uppercase tracking-wider text-sm">
              {t.play.matchSettings.title}
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6 flex flex-col gap-2">
            <button
              onClick={() => setEndOpen(true)}
              className="py-4 rounded-md bg-destructive text-destructive-foreground text-left px-4 font-bold"
            >
              {t.play.matchSettings.endMatch}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={endOpen} onOpenChange={setEndOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.play.matchSettings.endConfirm.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.play.matchSettings.endConfirm.body}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.play.matchSettings.endConfirm.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEnd}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.play.matchSettings.endConfirm.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
