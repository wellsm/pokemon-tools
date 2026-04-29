import { useState } from 'react'
import { getPokemon, getSpriteUrl } from '@/lib/pokemon'
import { SilhouetteCanvas } from './silhouette-canvas'

export type BinderSlotProps = {
  pokemonId: number
  owned: boolean
  highlighted?: boolean
  onToggle: () => void
}

export function BinderSlot({ pokemonId, owned, highlighted, onToggle }: BinderSlotProps) {
  const pokemon = getPokemon(pokemonId)
  const [imgFailed, setImgFailed] = useState(false)
  const showSprite = owned && !imgFailed

  return (
    <button
      onClick={onToggle}
      className={`group relative w-full h-full min-h-0 rounded-md overflow-hidden border
                  ${owned ? 'border-border bg-muted' : 'border-border bg-card'}
                  hover:border-primary transition-colors
                  ${highlighted ? 'card-highlighted' : ''}`}
      aria-label={`${pokemon?.name ?? 'Slot'} — ${owned ? 'owned' : 'missing'}`}
    >
      {showSprite ? (
        <img
          src={getSpriteUrl(pokemonId)}
          alt={pokemon?.name ?? `#${pokemonId}`}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <SilhouetteCanvas pokemonId={pokemonId} />
      )}
      <span className="absolute bottom-0 inset-x-0 px-1 py-0.5
                       text-[10px] font-bold uppercase tracking-wider text-foreground
                       bg-background/70 truncate">
        #{pokemonId} {pokemon?.name}
      </span>
    </button>
  )
}
