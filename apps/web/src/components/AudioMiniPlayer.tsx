import { useEffect } from 'react';
import { Play, Pause, X, Volume2, ChevronUp, MoreVertical } from 'lucide-react';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';

interface AudioMiniPlayerProps {
  onExpand: () => void;
  onContextMenu: (x: number, y: number) => void;
}

export default function AudioMiniPlayer({ onExpand, onContextMenu }: AudioMiniPlayerProps) {
  const { playlist, currentIndex, isPlaying, currentTime, duration, audioElement, setIsPlaying, close } = useAudioPlayerStore();

  const currentTrack = playlist[currentIndex];

  const togglePlay = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-surface-secondary/60 hover:bg-surface-hover transition-colors w-full flex-shrink-0 relative">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-accent/20 hover:bg-accent/30 flex items-center justify-center flex-shrink-0 transition-colors"
      >
        {isPlaying ? (
          <Pause size={14} className="text-accent fill-accent" />
        ) : (
          <Play size={14} className="text-accent fill-accent ml-0.5" />
        )}
      </button>

      {/* Track info */}
      <button onClick={onExpand} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <Volume2 size={14} className="text-vortex-400 flex-shrink-0" />
          <p className="text-xs font-medium text-vortex-400">Audio Player</p>
        </div>
        <p className="text-sm text-zinc-300 truncate">
          {currentTrack?.title || 'Audio'} • {formatTime(currentTime)} / {formatTime(duration)}
        </p>
      </button>

      {/* Context menu button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onContextMenu(e.clientX, e.clientY);
        }}
        className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors flex-shrink-0"
      >
        <MoreVertical size={14} className="text-zinc-500" />
      </button>

      {/* Expand button */}
      <button
        onClick={onExpand}
        className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors flex-shrink-0"
      >
        <ChevronUp size={16} className="text-zinc-500" />
      </button>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors flex-shrink-0"
      >
        <X size={16} className="text-zinc-500 hover:text-white" />
      </button>
    </div>
  );
}
