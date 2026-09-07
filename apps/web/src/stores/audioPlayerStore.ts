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
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;

  setPlaylist: (playlist: AudioTrack[], initialIndex: number, chatId: string) => void;
  setAudioElement: (audio: HTMLAudioElement) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  close: () => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  playlist: [],
  currentIndex: 0,
  isVisible: false,
  chatId: null,
  audioElement: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,

  setPlaylist: (playlist, initialIndex, chatId) => {
    console.log('[AudioPlayerStore] setPlaylist called:', { playlist, initialIndex, chatId });
    const audio = get().audioElement;
    set({ playlist, currentIndex: initialIndex, isVisible: true, chatId });

    // Load new track
    if (audio && playlist[initialIndex]) {
      audio.src = playlist[initialIndex].url;
      audio.load();
      audio.play().catch(() => {});
      set({ isPlaying: true });
    }
  },

  setAudioElement: (audio) => {
    set({ audioElement: audio });
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),

  nextTrack: () => {
    const { currentIndex, playlist, audioElement } = get();
    if (currentIndex < playlist.length - 1) {
      const newIndex = currentIndex + 1;
      set({ currentIndex: newIndex });
      if (audioElement && playlist[newIndex]) {
        audioElement.src = playlist[newIndex].url;
        audioElement.load();
        audioElement.play().catch(() => {});
        set({ isPlaying: true });
      }
    }
  },

  prevTrack: () => {
    const { currentIndex, playlist, audioElement } = get();
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      set({ currentIndex: newIndex });
      if (audioElement && playlist[newIndex]) {
        audioElement.src = playlist[newIndex].url;
        audioElement.load();
        audioElement.play().catch(() => {});
        set({ isPlaying: true });
      }
    }
  },

  close: () => {
    console.log('[AudioPlayerStore] close called');
    const audio = get().audioElement;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    set({ isVisible: false, isPlaying: false });
  },
}));
