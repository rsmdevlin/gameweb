import { create } from 'zustand';
import { api } from '../lib/api';

export type AppTheme = 'light' | 'dark';
export type NightMode = 'system' | 'off' | 'scheduled' | 'auto';

interface ThemeState {
  // Основная тема
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;

  // Ночной режим
  nightMode: NightMode;
  setNightMode: (mode: NightMode) => void;

  // Расписание для ночного режима
  nightModeSchedule: {
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
  };
  setNightModeSchedule: (schedule: { startTime: string; endTime: string }) => void;

  // Размер текста (0.8 - 1.2)
  textSize: number;
  setTextSize: (size: number) => void;

  // Радиус углов сообщений (0 - 24)
  messageRadius: number;
  setMessageRadius: (radius: number) => void;

  // Тема чата
  chatTheme: string;
  setChatTheme: (theme: string) => void;

  // Обои чата
  chatWallpaper: string | null;
  setChatWallpaper: (wallpaper: string | null) => void;

  // Акцентный цвет
  accentColor: string;
  setAccentColor: (color: string) => void;

  // Применение темы к DOM
  applyTheme: () => void;

  // Загрузка настроек из пользователя
  loadFromUser: (user: any) => void;

  // Синхронизация с API
  syncWithAPI: () => Promise<void>;
}

export const useAppThemeStore = create<ThemeState>()((set, get) => ({
  appTheme: 'dark',
  nightMode: 'system',
  nightModeSchedule: {
    startTime: '22:00',
    endTime: '08:00',
  },
  textSize: 1.0,
  messageRadius: 16,
  chatTheme: 'classic',
  chatWallpaper: null,
  accentColor: '#6366f1',

  setAppTheme: (theme) => {
    set({ appTheme: theme });
    get().applyTheme();
    get().syncWithAPI();
  },

  setNightMode: (mode) => {
    set({ nightMode: mode });
    get().applyTheme();
    get().syncWithAPI();
  },

  setNightModeSchedule: (schedule) => {
    set({ nightModeSchedule: schedule });
    get().applyTheme();
    get().syncWithAPI();
  },

  setTextSize: (size) => {
    const clampedSize = Math.max(0.8, Math.min(1.2, size));
    set({ textSize: clampedSize });
    document.documentElement.style.setProperty('--text-scale', clampedSize.toString());
    get().syncWithAPI();
  },

  setMessageRadius: (radius) => {
    const clampedRadius = Math.max(0, Math.min(24, radius));
    set({ messageRadius: clampedRadius });
    document.documentElement.style.setProperty('--message-radius', `${clampedRadius}px`);
    get().syncWithAPI();
  },

  setChatTheme: (theme) => {
    set({ chatTheme: theme });
    get().syncWithAPI();
  },

  setChatWallpaper: (wallpaper) => {
    set({ chatWallpaper: wallpaper });
    get().syncWithAPI();
  },

  setAccentColor: (color) => {
    set({ accentColor: color });
    document.documentElement.style.setProperty('--accent-color', color);
    get().syncWithAPI();
  },

  applyTheme: () => {
    const state = get();
    let finalTheme: AppTheme = state.appTheme;

    // Определяем финальную тему на основе nightMode
    if (state.nightMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      finalTheme = prefersDark ? 'dark' : 'light';
    } else if (state.nightMode === 'scheduled') {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { startTime, endTime } = state.nightModeSchedule;

      // Проверяем попадает ли текущее время в диапазон
      if (startTime < endTime) {
        // Обычный диапазон (например 08:00 - 22:00)
        finalTheme = currentTime >= startTime && currentTime < endTime ? 'light' : 'dark';
      } else {
        // Диапазон через полночь (например 22:00 - 08:00)
        finalTheme = currentTime >= startTime || currentTime < endTime ? 'dark' : 'light';
      }
    } else if (state.nightMode === 'off') {
      finalTheme = 'light';
    }
    // 'auto' использует state.appTheme как есть

    // Применяем тему
    document.documentElement.setAttribute('data-theme', finalTheme);
  },

  loadFromUser: (user) => {
    if (!user) return;

    const newState: any = {};
    if (user.appTheme) newState.appTheme = user.appTheme;
    if (user.nightMode) newState.nightMode = user.nightMode;
    if (user.nightStartTime || user.nightEndTime) {
      newState.nightModeSchedule = {
        startTime: user.nightStartTime || '22:00',
        endTime: user.nightEndTime || '08:00',
      };
    }
    if (typeof user.textSize === 'number') newState.textSize = user.textSize;
    if (typeof user.messageRadius === 'number') newState.messageRadius = user.messageRadius;
    if (user.chatTheme) newState.chatTheme = user.chatTheme;
    if (user.chatWallpaper !== undefined) newState.chatWallpaper = user.chatWallpaper;
    if (user.accentColor) newState.accentColor = user.accentColor;

    set(newState);

    // Применяем все настройки к DOM
    const state = get();
    state.applyTheme();
    document.documentElement.style.setProperty('--text-scale', state.textSize.toString());
    document.documentElement.style.setProperty('--message-radius', `${state.messageRadius}px`);
    document.documentElement.style.setProperty('--accent-color', state.accentColor);
  },

  syncWithAPI: async () => {
    try {
      const state = get();
      await api.updateAppearance({
        appTheme: state.appTheme,
        nightMode: state.nightMode,
        nightStartTime: state.nightModeSchedule.startTime,
        nightEndTime: state.nightModeSchedule.endTime,
        textSize: state.textSize,
        messageRadius: state.messageRadius,
        chatTheme: state.chatTheme,
        chatWallpaper: state.chatWallpaper,
        accentColor: state.accentColor,
      });
    } catch (error) {
      console.error('Failed to sync appearance settings:', error);
    }
  },
}));

// Инициализация при загрузке
if (typeof window !== 'undefined') {
  const store = useAppThemeStore.getState();
  store.applyTheme();
  document.documentElement.style.setProperty('--text-scale', store.textSize.toString());
  document.documentElement.style.setProperty('--message-radius', `${store.messageRadius}px`);

  // Слушаем изменения системной темы
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (store.nightMode === 'system') {
      store.applyTheme();
    }
  });

  // Проверяем расписание каждую минуту
  setInterval(() => {
    if (store.nightMode === 'scheduled') {
      store.applyTheme();
    }
  }, 60000);
}
