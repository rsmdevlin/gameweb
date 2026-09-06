import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  playlist: Array<{
    id: string;
    url: string;
    title: string;
    duration?: number;
  }>;
  initialIndex?: number;
  onClose: () => void;
}

export default function AudioPlayer({ playlist, initialIndex = 0, onClose }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-30 bg-surface-secondary/95 backdrop-blur-xl border-b border-border shadow-2xl"
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentTrack?.title || 'Audio'}
              </p>
              <p className="text-xs text-zinc-500">
                {currentIndex + 1} / {playlist.length}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Previous */}
              <button
                onClick={prevTrack}
                disabled={currentIndex === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <SkipBack size={16} className="text-white" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-accent hover:bg-accent/80 active:scale-95 transition-all"
              >
                {isPlaying ? (
                  <Pause size={18} className="text-white fill-white" />
                ) : (
                  <Play size={18} className="text-white fill-white ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={nextTrack}
                disabled={currentIndex === playlist.length - 1}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <SkipForward size={16} className="text-white" />
              </button>

              {/* Stop */}
              <button
                onClick={stop}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
              >
                <div className="w-3 h-3 bg-white rounded-sm" />
              </button>

              {/* Playback rate */}
              <button
                onClick={cyclePlaybackRate}
                className="px-3 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors text-xs font-medium text-white"
              >
                {playbackRate}x
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div
              className="h-1 bg-white/10 rounded-full cursor-pointer group"
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
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-zinc-500">{formatTime(currentTime)}</span>
              <span className="text-xs text-zinc-500">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} />
      </motion.div>
    </AnimatePresence>
  );
}
