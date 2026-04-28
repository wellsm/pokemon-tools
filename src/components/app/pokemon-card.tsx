import { ARTWORK_URL, TYPE_COLOR, getPokemonById } from '@/pokemon-data'
import { SilhouetteCanvas } from './silhouette-canvas'

interface Props {
  slotIndex: number
  pokemonId: number | null
  collected: boolean
  highlighted?: boolean
  onToggle: () => void
  onEmptyClick: () => void
}

export function PokemonCard({ slotIndex, pokemonId, collected, highlighted = false, onToggle, onEmptyClick }: Props) {
  if (pokemonId === null) {
    return (
      <button
        onClick={onEmptyClick}
        className="absolute inset-0 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-400 hover:bg-red-50 transition-all flex flex-col items-center justify-center gap-1 text-gray-300 hover:text-red-400 group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">+</span>
        <span className="text-[9px] text-gray-300">{slotIndex + 1}</span>
      </button>
    )
  }

  const pokemon = getPokemonById(pokemonId)
  const type1 = pokemon?.types[0]
  const color1 = type1 ? TYPE_COLOR[type1] ?? '#9E9E9E' : '#9E9E9E'

  return (
    <button
      onClick={onToggle}
      title={collected ? `Remover: ${pokemon?.name}` : `Coletar: ${pokemon?.name}`}
      className={`absolute inset-0 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-[1.04] hover:shadow-xl focus:outline-none${highlighted ? ' border-amber-400 animate-pulse' : ''}`}
      style={{
        boxShadow: collected ? `0 0 0 1px ${color1}20` : undefined,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: collected
            ? `linear-gradient(135deg, ${color1}15 0%, white 60%)`
            : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-2 pb-10">
        {collected ? (
          <img
            src={ARTWORK_URL(pokemonId)}
            alt={pokemon?.name}
            loading="lazy"
            className="w-full h-full object-contain drop-shadow-md"
          />
        ) : highlighted ? (
          <img
            src={ARTWORK_URL(pokemonId)}
            alt=""
            loading="eager"
            className="w-full h-full object-contain"
            style={{ opacity: 0.25, filter: 'grayscale(30%)' }}
          />
        ) : (
          <SilhouetteCanvas id={pokemonId} />
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 px-1.5 py-1.5 bg-white/90 backdrop-blur-sm">
        <p className="text-[8px] font-bold text-gray-400 leading-none">
          #{String(pokemonId).padStart(3, '0')}
        </p>
        <p className="text-[10px] font-bold text-gray-800 leading-snug truncate">
          {pokemon?.name ?? '???'}
        </p>
        {collected && pokemon && (
          <div className="flex gap-0.5 mt-0.5">
            {pokemon.types.map((t) => (
              <span
                key={t}
                className="text-[7px] font-bold text-white px-1 py-px rounded-sm leading-none"
                style={{ background: TYPE_COLOR[t] ?? '#9E9E9E' }}
              >
                {t.toUpperCase().slice(0, 3)}
              </span>
            ))}
          </div>
        )}
      </div>

      {collected && (
        <div
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
          style={{ background: color1 }}
        >
          <span className="text-white text-[9px] font-black">✓</span>
        </div>
      )}
    </button>
  )
}
