// src/App.tsx
import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom'
import { useBinderStore } from '@/store'
import { Home } from '@/pages/home'
import { BinderView } from '@/pages/binder'
import { Play } from '@/pages/play'
import { Settings } from '@/pages/settings'
import { TabBar } from '@/components/app/tab-bar'

function BinderRoute() {
  const { id } = useParams<{ id: string }>()
  const folder = useBinderStore((s) => s.folders.find((f) => f.id === id))
  if (!folder) return <Navigate to="/colecao" replace />
  return <BinderView folder={folder} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<TabBar />}>
          <Route path="/colecao" element={<Home />} />
          <Route path="/colecao/:id" element={<BinderRoute />} />
          <Route path="/jogar" element={<Play />} />
          <Route path="/config" element={<Settings />} />
        </Route>
        <Route path="/" element={<Navigate to="/colecao" replace />} />
        <Route path="/binders/:id" element={<Navigate to="/colecao" replace />} />
        <Route path="*" element={<Navigate to="/colecao" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
