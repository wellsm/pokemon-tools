import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { IndexPage } from '@/pages/index'
import { BinderListPage } from '@/pages/binder-list'
import { BinderDetailPage } from '@/pages/binder-detail'
import { PlayLandingPage } from '@/pages/play-landing'
import { PlaySetupPage } from '@/pages/play-setup'
import { PlayMatchPage } from '@/pages/play-match'
import { SettingsPage } from '@/pages/settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<IndexPage />} />
        <Route path="/binder"         element={<BinderListPage />} />
        <Route path="/binder/:id"     element={<BinderDetailPage />} />
        <Route path="/play"           element={<PlayLandingPage />} />
        <Route path="/play/new"       element={<PlaySetupPage />} />
        <Route path="/play/match"     element={<PlayMatchPage />} />
        <Route path="/settings"       element={<SettingsPage />} />
        {/* Legacy redirects */}
        <Route path="/colecao"        element={<Navigate to="/binder" replace />} />
        <Route path="/colecao/:id"    element={<Navigate to="/binder" replace />} />
        <Route path="/jogar"          element={<Navigate to="/play" replace />} />
        <Route path="/config"         element={<Navigate to="/settings" replace />} />
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
