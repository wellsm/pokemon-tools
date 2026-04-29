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
    if (!back) return
    if ('to' in back) navigate(back.to)
    else back.onClick()
  }

  return (
    <header className="sticky top-0 z-30 h-14 px-4 flex items-center gap-3
                       bg-surface-container-low border-b border-outline-variant">
      {back && (
        <button
          onClick={handleBack}
          aria-label="Back"
          className="p-2 -ml-2 rounded-md hover:bg-surface-container active:bg-surface-container-high"
        >
          <ArrowLeft strokeWidth={2} className="w-5 h-5" />
        </button>
      )}
      <Link to="/" className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-sm bg-primary-container" aria-hidden />
        <span className="font-bold tracking-wide text-primary text-xs uppercase whitespace-nowrap">
          Pokemon-Tools
        </span>
        {title && (
          <>
            <span className="text-outline-variant px-1" aria-hidden>|</span>
            <span className="text-on-surface-variant text-xs uppercase tracking-wider truncate">
              {title}
            </span>
          </>
        )}
      </Link>
      <div className="flex-1" />
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
