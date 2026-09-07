import { useRef, useState, useEffect } from 'react';
import { Play, Pause, X, Volume2, ChevronUp, MoreVertical } from 'lucide-react';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';

interface AudioMiniPlayerProps {
  onExpand: () => void;
  onContextMenu: (x: number, y: number) => void;
}

export default function AudioMiniPlayer({ onExpand, onContextMenu }: AudioMiniPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { playlist, currentIndex, close } = useAudioPlayerStore();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = playlist[currentIndex];

  // Load and play track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.url;
    audio.load();

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error('[AudioMiniPlayer] Play failed:', err);
        setIsPlaying(false);
      });
    }
  }, [currentIndex, currentTrack]);

  // Update time and duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentIndex < playlist.length - 1) {
        useAudioPlayerStore.setState({ currentIndex: currentIndex + 1 });
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, playlist.length]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Mini Player - в стиле закрепа */}
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

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </>
  );
}
