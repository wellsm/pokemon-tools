import { Header } from '@/components/layout/header'
import { GameSetup } from '@/components/play/game-setup'
import { useNavigate } from 'react-router-dom'
import { useMatchStore } from '@/stores/match-store'
import { useT } from '@/lib/i18n/store'

export function PlaySetupPage() {
  const t = useT()
  const navigate = useNavigate()
  const startMatch = useMatchStore((s) => s.startMatch)

  function handleStart() {
    startMatch({})
    navigate('/play/match')
  }

  return (
    <div className="min-h-screen">
      <Header back={{ to: '/play' }} title={t.play.setup.headerTitle} />
      <main className="px-4 max-w-3xl mx-auto ">
        <GameSetup onComplete={handleStart} />
      </main>
    </div>
  )
}
