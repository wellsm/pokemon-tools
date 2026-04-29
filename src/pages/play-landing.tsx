import { Header } from '@/components/layout/header'
import { PlayLandingCard } from '@/components/play/play-landing-card'
import { useT } from '@/lib/i18n/store'

export function PlayLandingPage() {
  const t = useT()
  return (
    <div className="min-h-screen">
      <Header back={{ to: '/' }} title={t.play.headerTitle} />
      <main className="px-4 max-w-3xl mx-auto mt-8">
        <PlayLandingCard />
      </main>
    </div>
  )
}
