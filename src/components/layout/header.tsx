import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

type BackProp = { to: string } | { onClick: () => void }

export type HeaderProps = {
  title?: string
  back?: BackProp
  actions?: ReactNode
}

export function Header({ title, back, actions }: HeaderProps) {
  const navigate = useNavigate()

  function handleBack() {
    if (!back) {
      return
    }

    if ('to' in back) {
      navigate(back.to)

      return;
    }

    back.onClick()
  }

  return (
    <header className="sticky top-0 z-30 p-4 flex items-center justify-between gap-3
                       bg-muted border-b border-border">
      {back ? (
        <button
          onClick={handleBack}
          aria-label="Back"
          className="p-2 -ml-2 rounded-md hover:bg-card active:bg-muted"
        >
          <ArrowLeft strokeWidth={2} className="w-5 h-5" />
        </button>
      ) : 
        <div className="w-6 h-6 rounded-sm bg-primary" aria-hidden />}
      <Link to="/" className="flex items-center gap-2 min-w-0">
        <span className="font-bold tracking-wide text-primary text-base uppercase whitespace-nowrap">
          {title || 'Pokemon Tools'}
        </span>
      </Link>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : <div className="w-1"/>}
    </header>
  )
}
