import { Link } from 'react-router-dom'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type TacticalCardProps = {
  icon: LucideIcon
  title: string
  subtitle: string
  cta: string
  to: string
  decorIcon?: LucideIcon
  badge?: ReactNode
}

export function TacticalCard({
  icon: Icon, title, subtitle, cta, to, decorIcon: Decor, badge,
}: TacticalCardProps) {
  return (
    <Link
      to={to}
      className="relative block p-6 rounded-xl bg-card border border-border
                 hover:border-primary transition-colors overflow-hidden"
    >
      {Decor && (
        <Decor
          aria-hidden
          className="absolute -right-4 -bottom-4 w-32 h-32 text-muted-foreground opacity-10"
          strokeWidth={1.5}
        />
      )}
      {badge && (
        <div className="absolute top-3 right-3">{badge}</div>
      )}
      <div className="w-10 h-10 rounded-md bg-primary/20
                      flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>
      <div className="flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-wider">
        {cta} <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
      </div>
    </Link>
  )
}
