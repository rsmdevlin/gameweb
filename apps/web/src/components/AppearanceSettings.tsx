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
  } = useAppThemeStore();

  const [showNightModeModal, setShowNightModeModal] = useState(false);
  const [showTextSizeModal, setShowTextSizeModal] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState(false);

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
            onClick={() => {/* TODO: открыть выбор темы чата */}}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-surface-tertiary/50 hover:bg-surface-hover transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vortex-500 to-purple-600 flex items-center justify-center">
              <Palette size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-zinc-200">Темы для чатов</p>
              <p className="text-xs text-zinc-500">Выберите стиль оформления</p>
            </div>
          </button>
        </div>

        {/* Обои для чатов */}
        <div className="px-4 py-1 mb-2">
          <button
            onClick={() => {/* TODO: открыть выбор обоев */}}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-surface-tertiary/50 hover:bg-surface-hover transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Wallpaper size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-zinc-200">Обои для чатов</p>
              <p className="text-xs text-zinc-500">Фон чата</p>
            </div>
          </button>
        </div>

        {/* Персональные цвета */}
        <div className="px-4 py-1 mb-2">
          <button
            onClick={() => {/* TODO: открыть выбор цветов */}}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-surface-tertiary/50 hover:bg-surface-hover transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
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
    </motion.div>
  );
}
