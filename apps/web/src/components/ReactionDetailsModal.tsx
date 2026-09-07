import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getMediaUrl } from '../lib/mediaUrl';

interface ReactionDetailsModalProps {
  emoji: string;
  users: Array<{ userId: string; displayName: string; username: string; avatar?: string }>;
  onClose: () => void;
}

export default function ReactionDetailsModal({ emoji, users, onClose }: ReactionDetailsModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-[80] backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] bg-surface-secondary rounded-2xl shadow-2xl border border-border overflow-hidden w-[90%] max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{emoji}</span>
            <h3 className="text-lg font-semibold text-white">{users.length}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        {/* Users list */}
        <div className="max-h-[400px] overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.userId}
              className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors"
            >
              {/* Avatar */}
              {user.avatar ? (
                <img
                  src={getMediaUrl(user.avatar)}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vortex-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {user.displayName[0]?.toUpperCase() || user.username[0]?.toUpperCase() || '?'}
                </div>
              )}

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                {user.username && (
                  <p className="text-xs text-zinc-500 truncate">@{user.username}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
