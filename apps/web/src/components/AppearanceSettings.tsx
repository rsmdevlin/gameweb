import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sun, Moon, Palette, Wallpaper, Type, Square, Clock, Monitor, Sparkles, Check } from 'lucide-react';
import { useState } from 'react';
import { useAppThemeStore } from '../stores/appThemeStore';

interface AppearanceSettingsProps {
  onBack: () => void;
}

export default function AppearanceSettings({ onBack }: AppearanceSettingsProps) {
  const {
    appTheme,
    setAppTheme,
    nightMode,
    setNightMode,
    nightModeSchedule,
    setNightModeSchedule,
    textSize,
    setTextSize,
    messageRadius,
    setMessageRadius,
    chatTheme,
    setChatTheme,
    chatWallpaper,
    setChatWallpaper,
    accentColor,
    setAccentColor,
  } = useAppThemeStore();

  const [showNightModeModal, setShowNightModeModal] = useState(false);
  const [showTextSizeModal, setShowTextSizeModal] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [showChatThemesModal, setShowChatThemesModal] = useState(false);
  const [showWallpapersModal, setShowWallpapersModal] = useState(false);
  const [showColorsModal, setShowColorsModal] = useState(false);

  const nightModeOptions = [
    { id: 'system', label: 'Системная', icon: Monitor, desc: 'Следовать настройкам системы' },
    { id: 'off', label: 'Выключена', icon: Sun, desc: 'Всегда светлая тема' },
    { id: 'scheduled', label: 'По расписанию', icon: Clock, desc: 'Автоматически по времени' },
    { id: 'auto', label: 'Автоматически', icon: Sparkles, desc: 'Управлять вручную' },
  ];

  const getNightModeLabel = () => {
    const opt = nightModeOptions.find((o) => o.id === nightMode);
    return opt?.label || 'Системная';
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-border flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="text-sm font-semibold text-white flex-1">Оформление</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Темы для чатов */}
        <div className="px-4 py-1 mb-2">
          <button
            onClick={() => setShowChatThemesModal(true)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-surface-tertiary/50 hover:bg-surface-hover transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vortex-500 to-purple-600 flex items-center justify-center">
              <Palette size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-zinc-200">Темы для чатов</p>
              <p className="text-xs text-zinc-500 capitalize">{chatTheme}</p>
            </div>
          </button>
        </div>

        {/* Обои для чатов */}
        <div className="px-4 py-1 mb-2">
          <button
            onClick={() => setShowWallpapersModal(true)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-surface-tertiary/50 hover:bg-surface-hover transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Wallpaper size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-zinc-200">Обои для чатов</p>
              <p className="text-xs text-zinc-500">{chatWallpaper ? 'Установлены' : 'Не установлены'}</p>
            </div>
          </button>
        </div>

        {/* Персональные цвета */}
        <div className="px-4 py-1 mb-2">
          <button
            onClick={() => setShowColorsModal(true)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-surface-tertiary/50 hover:bg-surface-hover transition-colors group"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-zinc-200">Персональные цвета</p>
              <p className="text-xs text-zinc-500">Акцентный цвет интерфейса</p>
            </div>
          </button>
        </div>

        {/* Ночная тема */}
        <div className="px-4 py-1 mb-2">
          <button
            onClick={() => setShowNightModeModal(true)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-surface-tertiary/50 hover:bg-surface-hover transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Moon size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-zinc-200">Ночная тема</p>
              <p className="text-xs text-zinc-500">{getNightModeLabel()}</p>
            </div>
          </button>
        </div>

        {/* Размер текста */}
        <div className="px-4 py-1 mb-2">
          <button
            onClick={() => setShowTextSizeModal(true)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-surface-tertiary/50 hover:bg-surface-hover transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Type size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-zinc-200">Размер текста</p>
              <p className="text-xs text-zinc-500">{Math.round(textSize * 100)}%</p>
            </div>
          </button>
        </div>

        {/* Углы блоков */}
        <div className="px-4 py-1 mb-2">
          <button
            onClick={() => setShowRadiusModal(true)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-surface-tertiary/50 hover:bg-surface-hover transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Square size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-zinc-200">Углы блоков с сообщениями</p>
              <p className="text-xs text-zinc-500">{messageRadius}px</p>
            </div>
          </button>
        </div>
      </div>

      {/* Night Mode Modal */}
      {showNightModeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowNightModeModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-secondary rounded-2xl border border-border shadow-2xl max-w-sm w-full overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-white">Ночная тема</h3>
              <p className="text-xs text-zinc-500 mt-1">Выберите режим переключения темы</p>
            </div>
            <div className="p-4 space-y-2">
              {nightModeOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setNightMode(opt.id as any);
                      if (opt.id !== 'scheduled') {
                        setShowNightModeModal(false);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      nightMode === opt.id
                        ? 'bg-vortex-500/20 ring-1 ring-vortex-500/30'
                        : 'bg-surface-tertiary/50 hover:bg-surface-hover'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      nightMode === opt.id ? 'bg-vortex-500/20' : 'bg-white/5'
                    }`}>
                      <Icon size={20} className={nightMode === opt.id ? 'text-vortex-400' : 'text-zinc-400'} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">{opt.label}</p>
                      <p className="text-xs text-zinc-500">{opt.desc}</p>
                    </div>
                    {nightMode === opt.id && <Check size={18} className="text-vortex-400" />}
                  </button>
                );
              })}

              {/* Расписание (показываем только если выбрано scheduled) */}
              {nightMode === 'scheduled' && (
                <div className="mt-4 p-4 bg-surface-tertiary rounded-xl border border-border">
                  <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wide">Расписание</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Темная тема с:</label>
                      <input
                        type="time"
                        value={nightModeSchedule.startTime}
                        onChange={(e) => setNightModeSchedule({ ...nightModeSchedule, startTime: e.target.value })}
                        className="w-full px-3 py-2 bg-surface rounded-lg text-sm text-white border border-border focus:border-vortex-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">До:</label>
                      <input
                        type="time"
                        value={nightModeSchedule.endTime}
                        onChange={(e) => setNightModeSchedule({ ...nightModeSchedule, endTime: e.target.value })}
                        className="w-full px-3 py-2 bg-surface rounded-lg text-sm text-white border border-border focus:border-vortex-500 transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNightModeModal(false)}
                    className="w-full mt-4 px-4 py-2.5 bg-vortex-500 hover:bg-vortex-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Сохранить
                  </button>
                </div>
              )}
            </div>

            {/* Preview themes at bottom */}
            <div className="px-4 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Предпросмотр</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setAppTheme('light')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    appTheme === 'light' ? 'border-vortex-500 bg-vortex-500/10' : 'border-border bg-surface-tertiary'
                  }`}
                >
                  <div className="w-full h-16 rounded-lg bg-white border border-gray-200 mb-2 flex items-center justify-center">
                    <Sun size={24} className="text-gray-700" />
                  </div>
                  <p className="text-xs text-center text-white font-medium">Светлая</p>
                </button>
                <button
                  onClick={() => setAppTheme('dark')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    appTheme === 'dark' ? 'border-vortex-500 bg-vortex-500/10' : 'border-border bg-surface-tertiary'
                  }`}
                >
                  <div className="w-full h-16 rounded-lg bg-zinc-900 border border-zinc-800 mb-2 flex items-center justify-center">
                    <Moon size={24} className="text-zinc-400" />
                  </div>
                  <p className="text-xs text-center text-white font-medium">Темная</p>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Text Size Modal */}
      {showTextSizeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowTextSizeModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-secondary rounded-2xl border border-border shadow-2xl max-w-sm w-full overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-white">Размер текста</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={textSize}
                  onChange={(e) => setTextSize(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-2">
                  <span>80%</span>
                  <span>{Math.round(textSize * 100)}%</span>
                  <span>120%</span>
                </div>
              </div>
              <div className="bg-surface-tertiary rounded-xl p-4 border border-border">
                <p className="text-zinc-300" style={{ fontSize: `${textSize}rem` }}>
                  Привет! Это пример текста сообщения. Так будут выглядеть ваши сообщения в чате.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Radius Modal */}
      {showRadiusModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRadiusModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-secondary rounded-2xl border border-border shadow-2xl max-w-sm w-full overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-white">Углы блоков</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="2"
                  value={messageRadius}
                  onChange={(e) => setMessageRadius(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-2">
                  <span>0px</span>
                  <span>{messageRadius}px</span>
                  <span>24px</span>
                </div>
              </div>
              <div className="space-y-3">
                <div
                  className="bg-blue-500 text-white px-4 py-3 max-w-[80%] ml-auto"
                  style={{ borderRadius: `${messageRadius}px` }}
                >
                  <p className="text-sm">Привет! Как дела?</p>
                </div>
                <div
                  className="bg-surface-tertiary text-white px-4 py-3 max-w-[80%] border border-border"
                  style={{ borderRadius: `${messageRadius}px` }}
                >
                  <p className="text-sm">Отлично, спасибо!</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Chat Themes Modal */}
      {showChatThemesModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowChatThemesModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-secondary rounded-2xl border border-border shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-white">Темы для чатов</h3>
              <p className="text-xs text-zinc-500 mt-1">Выберите тему оформления</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {[
                { id: 'classic', name: 'Classic', preview: 'bg-surface' },
                { id: 'midnight', name: 'Midnight', preview: 'chat-theme-midnight' },
                { id: 'ocean', name: 'Ocean', preview: 'chat-theme-ocean' },
                { id: 'forest', name: 'Forest', preview: 'chat-theme-forest' },
                { id: 'sunset', name: 'Sunset', preview: 'chat-theme-sunset' },
                { id: 'neon', name: 'Neon', preview: 'chat-theme-neon' },
                { id: 'aurora', name: 'Aurora', preview: 'chat-theme-aurora' },
                { id: 'cyber', name: 'Cyber', preview: 'chat-theme-cyber' },
                { id: 'glass', name: 'Glass', preview: 'chat-theme-glass' },
                { id: 'void', name: 'Void', preview: 'chat-theme-void' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setChatTheme(theme.id);
                    setShowChatThemesModal(false);
                  }}
                  className={`relative overflow-hidden rounded-xl transition-all ${
                    chatTheme === theme.id
                      ? 'ring-2 ring-vortex-500 scale-[1.02]'
                      : 'hover:scale-[1.02]'
                  }`}
                >
                  <div className={`${theme.preview} h-24 w-full`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-3">
                    <p className="text-sm font-medium text-white">{theme.name}</p>
                    {chatTheme === theme.id && (
                      <Check size={16} className="absolute top-2 right-2 text-vortex-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Wallpapers Modal */}
      {showWallpapersModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowWallpapersModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-secondary rounded-2xl border border-border shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-white">Обои для чатов</h3>
              <p className="text-xs text-zinc-500 mt-1">Выберите или загрузите обои</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3 mb-4 max-h-[50vh] overflow-y-auto">
                {[
                  { id: 'none', name: 'Без обоев', color: 'bg-surface' },
                  { id: 'gradient1', name: 'Gradient 1', color: 'bg-gradient-to-br from-blue-500 to-purple-600' },
                  { id: 'gradient2', name: 'Gradient 2', color: 'bg-gradient-to-br from-pink-500 to-orange-500' },
                  { id: 'gradient3', name: 'Gradient 3', color: 'bg-gradient-to-br from-green-500 to-teal-600' },
                  { id: 'pattern1', name: 'Pattern 1', color: 'bg-zinc-900' },
                  { id: 'pattern2', name: 'Pattern 2', color: 'bg-zinc-800' },
                ].map((wallpaper) => (
                  <button
                    key={wallpaper.id}
                    className={`relative overflow-hidden rounded-xl h-24 transition-all hover:scale-[1.05] ${wallpaper.color}`}
                  >
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <p className="text-xs font-medium text-white drop-shadow-lg">{wallpaper.name}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button className="w-full py-3 px-4 bg-vortex-500 hover:bg-vortex-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                <Wallpaper size={16} />
                Загрузить свои обои
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Personal Colors Modal */}
      {showColorsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowColorsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-secondary rounded-2xl border border-border shadow-2xl max-w-sm w-full overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-white">Персональные цвета</h3>
              <p className="text-xs text-zinc-500 mt-1">Выберите акцентный цвет</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-5 gap-3 mb-6">
                {[
                  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444',
                  '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
                  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`w-10 h-10 rounded-full transition-all hover:scale-110 ${
                      accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-secondary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {accentColor === color && <Check size={16} className="text-white mx-auto" />}
                  </button>
                ))}
              </div>
              <div className="mb-6">
                <label className="text-xs text-zinc-500 mb-2 block">Свой цвет:</label>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-full h-12 rounded-lg border border-border bg-surface cursor-pointer"
                />
              </div>
              <div className="bg-surface-tertiary rounded-xl p-4 border border-border">
                <p className="text-xs text-zinc-500 mb-3">Предпросмотр:</p>
                <div className="space-y-2">
                  <div
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: accentColor }}
                  >
                    Кнопка
                  </div>
                  <div
                    className="px-4 py-3 rounded-lg bg-surface-tertiary border"
                    style={{ borderColor: accentColor }}
                  >
                    <p className="text-sm text-white">Сообщение с акцентом</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
