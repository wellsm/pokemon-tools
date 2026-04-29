import { useNavigate } from 'react-router-dom'
import { Play, Plus } from 'lucide-react'
import { useMatchStore } from '@/stores/match-store'

function timeAgo(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `há ${mins}min`
  const h = Math.floor(mins / 60)
  return `há ${h}h${mins % 60 ? ` ${mins % 60}min` : ''}`
}

export function PlayLandingCard() {
  const navigate = useNavigate()
  const active = useMatchStore((s) => s.active)
  const startedAt = useMatchStore((s) => s.startedAt)
  const opponentName = useMatchStore((s) => s.opponentName)
  const prize = useMatchStore((s) => s.prize)
  const endMatch = useMatchStore((s) => s.endMatch)

  function startNew() {
    if (active) {
      const ok = window.confirm('Existe uma batalha em andamento. Descartar e iniciar nova?')
      if (!ok) return
      endMatch()
    }
    navigate('/play/new')
  }

  if (active && startedAt) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/play/match')}
          className="p-5 rounded-xl bg-surface-container border border-outline-variant text-left
                     hover:border-outline transition-colors"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-primary-container">
            Continue Battle
          </p>
          <p className="mt-2 text-lg font-bold text-on-surface">
            {opponentName ? `vs ${opponentName}` : 'Match in progress'}
          </p>
          <p className="text-sm text-on-surface-variant">
            iniciada {timeAgo(startedAt)} · prize {prize.a}–{prize.b}
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-primary-container text-xs font-bold uppercase tracking-wider">
            Continue <Play className="w-3 h-3" strokeWidth={2.5} />
          </div>
        </button>
        <button
          onClick={startNew}
          className="text-sm text-on-surface-variant underline self-start"
        >
          New Battle (descarta atual)
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={startNew}
      className="w-full py-4 rounded-xl bg-primary-container text-on-primary-container
                 font-bold uppercase tracking-wider flex items-center justify-center gap-2"
    >
      <Plus strokeWidth={2.5} className="w-4 h-4" /> New Battle
    </button>
  )
}
