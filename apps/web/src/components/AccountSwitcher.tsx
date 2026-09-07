import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X } from 'lucide-react';
import { useAccountStore } from '../stores/accountStore';
import { useAuthStore } from '../stores/authStore';
import { getMediaUrl } from '../lib/mediaUrl';

interface AccountSwitcherProps {
  onClose: () => void;
  onAddAccount: () => void;
}

export default function AccountSwitcher({ onClose, onAddAccount }: AccountSwitcherProps) {
  const { accounts, currentAccountId, switchAccount, removeAccount, canAddAccount } = useAccountStore();
  const user = useAuthStore((state) => state.user);

  const isPremium = false; // TODO: получать из user.isPremium
  const limit = isPremium ? 6 : 3;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-secondary rounded-2xl border border-border shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Аккаунты</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {accounts.length} / {limit} {!isPremium && '(Premium: до 6)'}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Accounts list */}
        <div className="max-h-96 overflow-y-auto">
          {accounts.map((account) => {
            const isCurrent = account.id === currentAccountId;

            return (
              <button
                key={account.id}
                onClick={() => {
                  if (!isCurrent) {
                    switchAccount(account.id);
                  }
                }}
                className={`w-full px-6 py-4 flex items-center gap-3 transition-colors ${
                  isCurrent
                    ? 'bg-vortex-500/20 hover:bg-vortex-500/30'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Avatar */}
                {account.avatar ? (
                  <img
                    src={getMediaUrl(account.avatar)}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vortex-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {account.displayName[0]?.toUpperCase() || account.username[0]?.toUpperCase() || '?'}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-white truncate">{account.displayName || account.username}</p>
                  <p className="text-xs text-zinc-500 truncate">@{account.username}</p>
                </div>

                {/* Current indicator */}
                {isCurrent && (
                  <Check size={20} className="text-vortex-400 flex-shrink-0" />
                )}

                {/* Remove button (не показываем для текущего) */}
                {!isCurrent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Удалить аккаунт @${account.username}?`)) {
                        removeAccount(account.id);
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </button>
            );
          })}
        </div>

        {/* Add account button */}
        {canAddAccount(isPremium) ? (
          <button
            onClick={onAddAccount}
            className="w-full px-6 py-4 flex items-center gap-3 border-t border-border hover:bg-white/5 transition-colors text-vortex-400"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-vortex-400/50 flex items-center justify-center">
              <Plus size={24} />
            </div>
            <span className="text-sm font-medium">Добавить аккаунт</span>
          </button>
        ) : (
          <div className="px-6 py-4 border-t border-border">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
              <p className="text-xs text-amber-400">
                {isPremium
                  ? `Достигнут лимит: ${limit} аккаунтов`
                  : 'Достигнут лимит. Купите Basa Premium для до 6 аккаунтов!'}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
