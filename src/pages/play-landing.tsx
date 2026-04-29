import { Header } from '@/components/layout/header'
import { PlayLandingCard } from '@/components/play/play-landing-card'

export function PlayLandingPage() {
  return (
    <div className="min-h-screen">
      <Header back={{ to: '/' }} title="Battle Assistant" />
      <main className="px-4 max-w-screen-md mx-auto mt-8">
        <PlayLandingCard />
      </main>
    </div>
  )
}
