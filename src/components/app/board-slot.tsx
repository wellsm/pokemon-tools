// src/components/app/board-slot.tsx
import type { BoardSlot as BoardSlotType } from '@/game-data'
import { ENERGY_EMOJI, ENERGY_COLOR } from '@/game-data'

interface BoardSlotProps {
  slot: BoardSlotType
  label: string
  variant: 'my' | 'opponent'
  onClick: () => void
}

export function BoardSlot({ slot, label, variant, onClick }: BoardSlotProps) {
  const isActive = slot.position === 'active'
  const borderColor = variant === 'my' ? 'border-green-400' : 'border-red-400'
  const labelColor = variant === 'my' ? 'text-green-400' : 'text-red-400'
  const damageColor = slot.damage > 0 ? 'text-amber-400' : 'text-gray-500'

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded transition-colors ${
        isActive
          ? `w-14 h-[76px] border-2 ${borderColor} bg-gray-900`
          : 'w-[52px] h-[70px] border border-gray-700 bg-gray-900'
      }`}
    >
      <span className={`text-[8px] leading-none ${isActive ? labelColor : 'text-gray-500'}`}>
        {label}
      </span>
      <span className={`text-sm font-bold ${damageColor} mt-0.5`}>
        {slot.damage}
      </span>
      {slot.energies.length > 0 && (
        <div className="flex gap-px mt-1 flex-wrap justify-center max-w-full px-0.5">
          {slot.energies.map((e, i) => (
            <span
              key={i}
              className="w-[10px] h-[10px] rounded-full border flex items-center justify-center text-[6px] leading-none"
              style={{ borderColor: ENERGY_COLOR[e], backgroundColor: `${ENERGY_COLOR[e]}20` }}
            >
              {ENERGY_EMOJI[e]}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
