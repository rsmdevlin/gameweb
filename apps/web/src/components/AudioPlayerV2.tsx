import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, SkipBack, SkipForward, Volume2, ChevronDown, ChevronUp, MoreVertical, Bookmark, MessageSquare, Trash2 } from 'lucide-react';
import { useLongPress } from '../hooks/useLongPress';

interface AudioTrack {
  id: string;
  url: string;
  title: string;
  duration?: number;
  messageId: string;
  senderId?: string;
  canDelete?: boolean;
}

interface AudioPlayerV2Props {
  playlist: AudioTrack[];
  initialIndex?: number;
  onClose: () => void;
  onShowInChat?: (messageId: string) => void;
  onSaveToFavorites?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export default function AudioPlayerV2({
  playlist,
  initialIndex = 0,
  onClose,
  onShowInChat,
  onSaveToFavorites,
  onDelete,
}: AudioPlayerV2Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ trackId: string; x: number; y: number } | null>(null);

  const currentTrack = playlist[currentIndex];

  // Load and play track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.url;
    audio.playbackRate = playbackRate;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex, currentTrack]);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      // Auto play next track
      if (currentIndex < playlist.length - 1) {
        setCurrentIndex(currentIndex + 1);
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
  }, [currentIndex, playlist.length, isDragging]);

  // Update playback rate
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackRate;
    }
  }, [playbackRate]);

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

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const nextTrack = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    }
  };

  const prevTrack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.5, 2];
    const currentRateIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentRateIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressDragStart = () => {
    setIsDragging(true);
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    setCurrentTime(newTime);
  };

  const handleProgressDragEnd = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setIsDragging(false);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTrackClick = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const longPressHandlers = useLongPress({
    onLongPress: (clientX, clientY, trackId) => {
      setContextMenu({ trackId, x: clientX, y: clientY });
    },
    delay: 500,
    moveThreshold: 10,
  });

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu]);

  return (
    <>
      <AnimatePresence>
        {/* Mini Player (collapsed) */}
        {!isExpanded && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-30 bg-surface-secondary/95 backdrop-blur-xl border-t border-border shadow-2xl"
          >
            <div className="max-w-4xl mx-auto px-4 py-2">
              {/* Progress bar at top */}
              <div
                className="h-0.5 bg-white/10 cursor-pointer -mx-4 mb-2"
                onClick={handleProgressClick}
                onMouseDown={handleProgressDragStart}
                onMouseMove={handleProgressDrag}
                onMouseUp={handleProgressDragEnd}
                onMouseLeave={handleProgressDragEnd}
              >
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Expand button */}
                <button
                  onClick={() => setIsExpanded(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  <ChevronUp size={18} className="text-white" />
                </button>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {currentTrack?.title || 'Audio'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  {/* Previous */}
                  <button
                    onClick={prevTrack}
                    disabled={currentIndex === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors disabled:opacity-30"
                  >
                    <SkipBack size={14} className="text-white" />
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-accent hover:bg-accent/80 transition-all"
                  >
                    {isPlaying ? (
                      <Pause size={16} className="text-white fill-white" />
                    ) : (
                      <Play size={16} className="text-white fill-white ml-0.5" />
                    )}
                  </button>

                  {/* Next */}
                  <button
                    onClick={nextTrack}
                    disabled={currentIndex === playlist.length - 1}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors disabled:opacity-30"
                  >
                    <SkipForward size={14} className="text-white" />
                  </button>

                  {/* Close */}
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Player (expanded) */}
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-surface flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <button
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <ChevronDown size={20} className="text-white" />
              </button>
              <h2 className="text-lg font-semibold text-white">Audio Player</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Current track info */}
            <div className="px-6 py-8 border-b border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-purple-600 rounded-xl flex items-center justify-center">
                  <Volume2 size={32} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-semibold text-white truncate mb-1">
                    {currentTrack?.title || 'Audio'}
                  </p>
                  <p className="text-sm text-zinc-500">
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
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={prevTrack}
                  disabled={currentIndex === 0}
                  className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors disabled:opacity-30"
                >
                  <SkipBack size={20} className="text-white" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-accent hover:bg-accent/80 transition-all shadow-lg"
                >
                  {isPlaying ? (
                    <Pause size={24} className="text-white fill-white" />
                  ) : (
                    <Play size={24} className="text-white fill-white ml-1" />
                  )}
                </button>

                <button
                  onClick={nextTrack}
                  disabled={currentIndex === playlist.length - 1}
                  className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors disabled:opacity-30"
                >
                  <SkipForward size={20} className="text-white" />
                </button>
              </div>

              {/* Speed control */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={cyclePlaybackRate}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white"
                >
                  {playbackRate}x
                </button>
                <button
                  onClick={stop}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white"
                >
                  Stop
                </button>
              </div>
            </div>

            {/* Playlist */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-white">Playlist ({playlist.length})</h3>
              </div>
              <div className="divide-y divide-border">
                {playlist.map((track, index) => {
                  const isCurrentTrack = index === currentIndex;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleTrackClick(index)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ trackId: track.id, x: e.clientX, y: e.clientY });
                      }}
                      {...longPressHandlers}
                      data-track-id={track.id}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors ${
                        isCurrentTrack ? 'bg-accent/10' : ''
                      }`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        {isCurrentTrack && isPlaying ? (
                          <Pause size={16} className="text-accent" />
                        ) : (
                          <Play size={16} className="text-accent ml-0.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-accent' : 'text-white'}`}>
                          {track.title}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {track.duration ? formatTime(track.duration) : '--:--'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenu({ trackId: track.id, x: e.clientX, y: e.clientY });
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                      >
                        <MoreVertical size={16} className="text-zinc-400" />
                      </button>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setContextMenu(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ left: contextMenu.x, top: contextMenu.y }}
              className="fixed z-[70] bg-surface-secondary rounded-lg shadow-2xl border border-border overflow-hidden min-w-[200px]"
            >
              <button
                onClick={() => {
                  const track = playlist.find((t) => t.id === contextMenu.trackId);
                  if (track && onSaveToFavorites) {
                    onSaveToFavorites(track.messageId);
                  }
                  setContextMenu(null);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-white text-sm"
              >
                <Bookmark size={16} />
                <span>Сохранить в</span>
              </button>
              <button
                onClick={() => {
                  const track = playlist.find((t) => t.id === contextMenu.trackId);
                  if (track && onShowInChat) {
                    onShowInChat(track.messageId);
                  }
                  setContextMenu(null);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-white text-sm"
              >
                <MessageSquare size={16} />
                <span>Показать в чате</span>
              </button>
              {(() => {
                const track = playlist.find((t) => t.id === contextMenu.trackId);
                return track?.canDelete ? (
                  <button
                    onClick={() => {
                      if (track && onDelete) {
                        onDelete(track.messageId);
                      }
                      setContextMenu(null);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors text-red-500 text-sm"
                  >
                    <Trash2 size={16} />
                    <span>Удалить</span>
                  </button>
                ) : null;
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </>
  );
}
