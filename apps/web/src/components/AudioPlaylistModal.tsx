import { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Play, Pause, MoreVertical, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import { useLongPress } from '../hooks/useLongPress';

interface AudioPlaylistModalProps {
  onClose: () => void;
  onContextMenu: (x: number, y: number) => void;
}

export default function AudioPlaylistModal({ onClose, onContextMenu }: AudioPlaylistModalProps) {
  const { playlist, currentIndex, isPlaying, currentTime, duration, audioElement, setIsPlaying, nextTrack, prevTrack } = useAudioPlayerStore();
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTrackClick = (index: number) => {
    const track = playlist[index];
    if (!track || !audioElement) return;

    useAudioPlayerStore.setState({ currentIndex: index });
    audioElement.src = track.url;
    audioElement.load();
    audioElement.play().catch(() => {});
  };

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

  const cyclePlaybackRate = () => {
    const rates = [1, 1.5, 2];
    const currentRateIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentRateIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioElement) {
      audioElement.playbackRate = nextRate;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioElement) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioElement.currentTime = newTime;
  };

  const handleProgressDragStart = () => {
    setIsDragging(true);
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !audioElement) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    audioElement.currentTime = newTime;
  };

  const handleProgressDragEnd = () => {
    setIsDragging(false);
  };

  const formatTime = (seconds: number | undefined) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const longPressHandlers = useLongPress({
    onLongPress: (clientX, clientY) => {
      onContextMenu(clientX, clientY);
    },
    delay: 500,
    moveThreshold: 10,
  });

  const currentTrack = playlist[currentIndex];

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 150) {
      // Drag down - close
      onClose();
    } else if (info.offset.y < -100 && !isExpanded) {
      // Drag up - expand to full screen
      setIsExpanded(true);
    }
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.5, bottom: 0.5 }}
      onDragEnd={handleDragEnd}
      initial={{ y: '100%' }}
      animate={{ y: 0, height: isExpanded ? '100vh' : '50vh' }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 flex items-end pointer-events-none"
    >
      <div className={`w-full max-w-2xl mx-auto ${isExpanded ? 'h-screen' : 'h-1/2'} bg-surface rounded-t-3xl shadow-2xl border-t border-l border-r border-border flex flex-col pointer-events-auto transition-all duration-300`}>
        {/* Drag handle */}
        <div className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing flex-shrink-0">
          <div className="w-12 h-1 bg-zinc-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white text-center">Audio Player</h2>
        </div>

        {/* Current track info + controls */}
        <div className="px-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-accent to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Volume2 size={28} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-white truncate">
                {currentTrack?.title || 'Audio'}
              </p>
              <p className="text-xs text-zinc-500">
                {currentIndex + 1} / {playlist.length}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="h-1.5 bg-white/10 rounded-full cursor-pointer group mb-2"
            onClick={handleProgressClick}
            onMouseDown={handleProgressDragStart}
            onMouseMove={handleProgressDrag}
            onMouseUp={handleProgressDragEnd}
            onMouseLeave={handleProgressDragEnd}
          >
            <div
              className="h-full bg-accent rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={cyclePlaybackRate}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium text-white"
            >
              {playbackRate}x
            </button>

            <button
              onClick={() => prevTrack()}
              disabled={currentIndex === 0}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <SkipBack size={18} className="text-white" />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-accent hover:bg-accent/80 transition-all shadow-lg"
            >
              {isPlaying ? (
                <Pause size={20} className="text-white fill-white" />
              ) : (
                <Play size={20} className="text-white fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => nextTrack()}
              disabled={currentIndex === playlist.length - 1}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <SkipForward size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Playlist */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            <h3 className="text-sm font-semibold text-white">Playlist ({playlist.length})</h3>
          </div>
          <div className="divide-y divide-border/50">
            {playlist.map((track, index) => {
              const isCurrentTrack = index === currentIndex;
              return (
                <button
                  key={track.id}
                  onClick={() => handleTrackClick(index)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onContextMenu(e.clientX, e.clientY);
                  }}
                  {...longPressHandlers}
                  data-track-id={track.id}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors ${
                    isCurrentTrack ? 'bg-accent/10' : ''
                  }`}
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-accent/20 to-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {isCurrentTrack && isPlaying ? (
                      <Pause size={14} className="text-accent" />
                    ) : (
                      <Play size={14} className="text-accent ml-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-accent' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatTime(track.duration)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onContextMenu(e.clientX, e.clientY);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  >
                    <MoreVertical size={14} className="text-zinc-400" />
                  </button>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
