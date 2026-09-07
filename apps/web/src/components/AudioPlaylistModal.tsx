import { motion } from 'framer-motion';
import { ChevronDown, Play, Pause, MoreVertical, Volume2 } from 'lucide-react';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import { useLongPress } from '../hooks/useLongPress';

interface AudioPlaylistModalProps {
  onClose: () => void;
  onContextMenu: (x: number, y: number) => void;
}

export default function AudioPlaylistModal({ onClose, onContextMenu }: AudioPlaylistModalProps) {
  const { playlist, currentIndex, isPlaying, audioElement } = useAudioPlayerStore();

  const handleTrackClick = (index: number) => {
    const track = playlist[index];
    if (!track || !audioElement) return;

    useAudioPlayerStore.setState({ currentIndex: index });
    audioElement.src = track.url;
    audioElement.load();
    audioElement.play().catch(() => {});
  };

  const formatTime = (seconds: number | undefined) => {
    if (!seconds || !isFinite(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const longPressHandlers = useLongPress({
    onLongPress: (clientX, clientY) => {
      onContextMenu(clientX, clientY);
    },
    delay: 500,
    moveThreshold: 10,
  });

  const currentTrack = playlist[currentIndex];

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-surface flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronDown size={20} className="text-white" />
        </button>
        <h2 className="text-lg font-semibold text-white">Audio Player</h2>
        <div className="w-8" />
      </div>

      {/* Current track info */}
      <div className="px-6 py-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
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
                  onContextMenu(e.clientX, e.clientY);
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
                  <MoreVertical size={16} className="text-zinc-400" />
                </button>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
