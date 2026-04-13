import { createPortal } from "react-dom";
import { XIcon, ClockIcon } from "lucide-react";
import { type Side, useGameStore } from "@/game-store";
import { useIsMobile } from "@/hooks/use-mobile";

interface GameHistoryProps {
  open: boolean;
  side: Side;
  onOpenChange: (open: boolean) => void;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

const TYPE_ICONS: Record<string, string> = {
  move: '↔',
  damage: '💥',
  energy: '⚡',
  slot: '📋',
  turn: '🔄',
  coin: '🪙',
};

export function GameHistory({ open, side, onOpenChange }: GameHistoryProps) {
  const history = useGameStore((s) => s.history);
  const isMobile = useIsMobile();

  if (!open) return null;

  const content = (
    <div className={`bg-gray-900/95 border border-gray-700 flex flex-col ${
      isMobile
        ? 'rounded-t-2xl max-h-[70vh]'
        : 'rounded-2xl h-full max-h-[80vh] w-[300px]'
    } ${side === 'a' ? 'rotate-180' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <ClockIcon className="size-4 text-gray-400" />
          <span className="text-white font-bold text-sm">Histórico</span>
          <span className="text-xs text-gray-500">{history.length}</span>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">Nenhuma ação registrada</p>
        ) : (
          [...history].reverse().map((action) => (
            <div
              key={action.id}
              className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-gray-800/50"
            >
              <span className="text-sm shrink-0">{TYPE_ICONS[action.type] ?? '•'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 leading-snug">{action.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold ${action.side === 'a' ? 'text-blue-400' : 'text-red-400'}`}>
                    Lado {action.side.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-gray-500">{formatTime(action.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (isMobile) {
    // Drawer from bottom
    return createPortal(
      <div className={`fixed inset-0 z-50 flex flex-col ${side === 'a' ? 'justify-start' : 'justify-end'}`}>
        <button
          type="button"
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={() => onOpenChange(false)}
        />
        <div className="relative z-10">
          {content}
        </div>
      </div>,
      document.body,
    );
  }

  // Desktop: side panel that doesn't block interactions
  return createPortal(
    <div className={`fixed top-16 z-40 ${side === 'a' ? 'left-3 rotate-180' : 'right-3'}`}
      style={{ top: side === 'a' ? '12px' : undefined, bottom: side === 'b' ? '70px' : undefined }}
    >
      {content}
    </div>,
    document.body,
  );
}
