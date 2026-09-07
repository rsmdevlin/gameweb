import { create } from 'zustand';

interface AudioTrack {
  id: string;
  url: string;
  title: string;
  duration?: number;
  messageId: string;
  senderId?: string;
  canDelete?: boolean;
}

interface AudioPlayerState {
  playlist: AudioTrack[];
  currentIndex: number;
  isVisible: boolean;
  chatId: string | null;

  setPlaylist: (playlist: AudioTrack[], initialIndex: number, chatId: string) => void;
  close: () => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set) => ({
  playlist: [],
  currentIndex: 0,
  isVisible: false,
  chatId: null,

  setPlaylist: (playlist, initialIndex, chatId) => {
    console.log('[AudioPlayerStore] setPlaylist called:', { playlist, initialIndex, chatId });
    set({ playlist, currentIndex: initialIndex, isVisible: true, chatId });
  },

  close: () => {
    console.log('[AudioPlayerStore] close called');
    set({ isVisible: false });
  },
}));
