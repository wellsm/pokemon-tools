import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Plus } from 'lucide-react'
import { useMatchStore } from '@/stores/match-store'
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

export function PlayLandingCard() {
  const t = useT()
  const navigate = useNavigate()
  const { active, startedAt, opponentName, prize, endMatch } = useMatchStore()
  const [discardOpen, setDiscardOpen] = useState(false)

  function timeAgo(ts: number) {
    const mins = Math.floor((Date.now() - ts) / 60000)
    if (mins < 1) return t.play.landing.timeAgo.now
    if (mins < 60) return t.play.landing.timeAgo.minutes(mins)
    const h = Math.floor(mins / 60)
    return t.play.landing.timeAgo.hours(h, mins % 60)
  }

  function startNew() {
    if (active) {
      setDiscardOpen(true)
      return
    }
    navigate('/play/new')
  }

  function confirmDiscard() {
    endMatch()
    setDiscardOpen(false)
    navigate('/play/new')
  }

  if (active && startedAt) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/play/match')}
          className="p-5 rounded-xl bg-card border border-border text-left
                     hover:border-primary transition-colors"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            {t.play.landing.continueLabel}
          </p>
          <p className="mt-2 text-lg font-bold text-foreground">
            {opponentName ? `${t.play.match.opponentPrefix} ${opponentName}` : t.play.landing.matchInProgress}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.play.landing.startedAtPrefix} {timeAgo(startedAt)} · {t.play.landing.prizeLabel} {prize.a}–{prize.b}
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-wider">
            {t.play.landing.continue} <Play className="w-3 h-3" strokeWidth={2.5} />
          </div>
        </button>

        <button
          onClick={startNew}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground
                 font-bold uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <Plus strokeWidth={2.5} className="w-4 h-4" /> {t.play.landing.newBattleDiscards}
        </button>

        <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.play.discardConfirm.title}</AlertDialogTitle>
              <AlertDialogDescription>{t.play.discardConfirm.body}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.play.discardConfirm.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDiscard}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t.play.discardConfirm.confirm}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return (
    <button
      onClick={startNew}
      className="w-full py-4 rounded-xl bg-primary text-primary-foreground
                 font-bold uppercase tracking-wider flex items-center justify-center gap-2"
    >
      <Plus strokeWidth={2.5} className="w-4 h-4" /> {t.play.landing.newBattle}
    </button>
  )
}
