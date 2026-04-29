import { ClockIcon, XIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { type Side, useGameStore } from "@/stores/match-store";
import { useIsMobile } from "@/hooks/use-mobile";

interface GameHistoryProps {
  open: boolean;
  side: Side;
  onOpenChange: (open: boolean) => void;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

const TYPE_ICONS: Record<string, string> = {
  move: "↔",
  damage: "💥",
  energy: "⚡",
  slot: "📋",
  turn: "🔄",
  coin: "🪙",
};

export function GameHistory({ open, side, onOpenChange }: GameHistoryProps) {
  const history = useGameStore((s) => s.history);
  const prize = useGameStore((s) => s.prize);
  const isMobile = useIsMobile();

  if (!open) {
    return null;
  }

  const content = (
    <div
      className={`bg-card border border-border flex flex-col ${isMobile
        ? "rounded-t-2xl max-h-[70vh]"
        : "rounded-2xl h-full max-h-[80vh] w-[300px]"
        } ${side === "a" ? "rotate-180" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ClockIcon className="size-4 text-muted-foreground" />
          <span className="text-foreground font-bold text-sm">History</span>
          <span className="text-xs text-muted-foreground">{history.length}</span>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {history.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">
            No actions recorded
          </p>
        ) : (
          [...history].reverse().map((action) => (
            <div
              key={action.id}
              className="flex items-start gap-2 px-2.5 py-2 rounded-xl bg-card border border-border"
            >
              <span className="text-sm shrink-0">
                {TYPE_ICONS[action.type] ?? "•"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">
                  {action.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[10px] font-bold ${action.side === "a" ? "text-blue-400" : "text-red-400"}`}
                  >
                    Side {action.side.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatTime(action.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Quick Stats */}
        <div className="mt-6 p-4 rounded-xl border border-primary/40 bg-card">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prize Cards Left</span>
            <span className="text-primary font-bold">{prize.a} - {prize.b}</span>
          </div>
          <div className="flex justify-between mt-3">
            <div title="Em breve" className="opacity-50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Accuracy</p>
              <p className="text-foreground">--</p>
            </div>
            <div title="Em breve" className="opacity-50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tempo</p>
              <p className="text-foreground">--</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    // Drawer from bottom
    return createPortal(
      <div
        className={`fixed inset-0 z-50 flex flex-col ${side === "a" ? "justify-start" : "justify-end"}`}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={() => onOpenChange(false)}
        />
        <div className="relative z-10">{content}</div>
      </div>,
      document.body,
    );
  }

  // Desktop: side panel that doesn't block interactions
  return createPortal(
    <div
      className={`fixed z-40 ${side === "a" ? "left-3" : "right-3"}`}
      style={{
        top: side === "a" ? "12px" : undefined,
        bottom: side === "b" ? "70px" : undefined,
      }}
    >
      {content}
    </div>,
    document.body,
  );
}
