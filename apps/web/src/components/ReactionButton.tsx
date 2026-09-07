import { useLongPress } from '../hooks/useLongPress';

interface ReactionButtonProps {
  emoji: string;
  count: number;
  isMine: boolean;
  users: Array<{ userId: string; displayName: string; username: string; avatar?: string }>;
  onReact: (emoji: string) => void;
  onShowDetails: (emoji: string, users: any[]) => void;
}

export default function ReactionButton({ emoji, count, isMine, users, onReact, onShowDetails }: ReactionButtonProps) {
  const longPressHandlers = useLongPress({
    onLongPress: () => {
      onShowDetails(emoji, users);
    },
    delay: 500,
    moveThreshold: 10,
  });

  return (
    <button
      onClick={() => onReact(emoji)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onShowDetails(emoji, users);
      }}
      {...longPressHandlers}
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-all ${
        isMine
          ? 'bg-vortex-500/40 border border-vortex-500/60'
          : 'bg-white/10 border border-white/20 hover:bg-white/20'
      }`}
      title={users.map(u => u.displayName || u.username).join(', ')}
    >
      <span>{emoji}</span>
      {count > 1 && (
        <span className="text-white/80 text-[10px] font-medium">{count}</span>
      )}
    </button>
  );
}
