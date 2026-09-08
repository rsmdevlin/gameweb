import { useState, useRef, useEffect, memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { Check, CheckCheck, Image, FileText, Mic, Video, Pin, Trash2, Bookmark, Music } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { useLang } from '../lib/i18n';
import { stripMarkdown } from '../lib/utils';
import { api } from '../lib/api';
import { useLongPress } from '../hooks/useLongPress';
import ConfirmModal from './ConfirmModal';
import Avatar from './Avatar';
import type { Chat } from '../lib/types';

const API_URL = import.meta.env.VITE_API_URL || '';

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
}

function ChatListItem({ chat, isActive }: ChatListItemProps) {
  const { user } = useAuthStore();
  const { setActiveChat, loadMessages, typingUsers, drafts, loadChats } = useChatStore();
  const { t, lang } = useLang();

  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const ctxRef = useRef<HTMLDivElement>(null);

  const myMember = chat.members.find((m) => m.user.id === user?.id);
  const isPinned = myMember?.isPinned ?? false;

  const draft = drafts[chat.id] || '';

  const otherMember = chat.members.find((m) => m.user.id !== user?.id);
  const isFavorites = chat.type === 'favorites';
  const chatName = isFavorites
    ? t('favorites')
    : chat.type === 'personal'
      ? otherMember?.user.displayName || otherMember?.user.username || t('chat')
      : chat.name || t('group');

  const chatAvatar = isFavorites
    ? null
    : chat.type === 'personal'
      ? otherMember?.user.avatar
      : chat.avatar;

  const isOnline = chat.type === 'personal' && otherMember?.user.isOnline;

  // Check if someone is typing in this chat
  const typingInChat = typingUsers.filter((t) => t.chatId === chat.id && t.userId !== user?.id);
  const isTyping = typingInChat.length > 0;

  const lastMessage = chat.messages?.[0];

  const isMine = lastMessage?.senderId === user?.id;

  // Sender name for groups (show who sent the message)
  const senderName = chat.type === 'group' && lastMessage && !lastMessage.isDeleted
    ? isMine
      ? 'Вы'
      : chat.members.find(m => m.user.id === lastMessage.senderId)?.user.displayName?.split(' ')[0] ||
        chat.members.find(m => m.user.id === lastMessage.senderId)?.user.username ||
        'User'
    : null;

  // Message preview with media thumbnail
  const getMessagePreview = () => {
    if (!lastMessage) return { type: 'text', content: '' };
    if (lastMessage.isDeleted) return { type: 'text', content: t('messageDeleted') };

    if (lastMessage.type === 'voice') {
      return { type: 'icon', icon: Mic, text: t('voice') };
    }

    if (lastMessage.media && lastMessage.media.length > 0) {
      const media = lastMessage.media[0];
      if (media.type === 'image') {
        const mediaUrl = media.url?.startsWith('http') ? media.url : `${API_URL}${media.url}`;
        const thumbnailUrl = media.thumbnail ? (media.thumbnail.startsWith('http') ? media.thumbnail : `${API_URL}${media.thumbnail}`) : mediaUrl;
        return { type: 'image', url: thumbnailUrl, text: t('photo') };
      }
      if (media.type === 'video') {
        const mediaUrl = media.url?.startsWith('http') ? media.url : `${API_URL}${media.url}`;
        const thumbnailUrl = media.thumbnail ? (media.thumbnail.startsWith('http') ? media.thumbnail : `${API_URL}${media.thumbnail}`) : mediaUrl;
        return { type: 'video', url: thumbnailUrl, text: t('video') };
      }
      if (media.type === 'file') {
        return { type: 'icon', icon: FileText, text: media.filename || t('file') };
      }
      if (media.type === 'audio') {
        return { type: 'icon', icon: Music, text: t('file') };
      }
    }

    if (lastMessage.content) {
      return { type: 'text', content: stripMarkdown(lastMessage.content) };
    }

    return { type: 'text', content: '' };
  };

  const messagePreview = getMessagePreview();

  // Галочки прочтения: две галочки если хоть кто-то кроме меня прочитал
  const isRead = lastMessage?.readBy?.some((r) => r.userId !== user?.id);
  const isSent = !!lastMessage; // Показываем одну галочку если сообщение отправлено

  // Time in HH:MM format instead of "около часа назад"
  const timeStr = lastMessage
    ? new Date(lastMessage.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    : '';

  const handleClick = () => {
    setActiveChat(chat.id);
    loadMessages(chat.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  };

  // Long press for mobile
  const longPressHandlers = useLongPress({
    onLongPress: (clientX, clientY) => {
      setCtxMenu({ x: clientX, y: clientY });
    },
    delay: 500,
    moveThreshold: 10,
  });

  useEffect(() => {
    if (!ctxMenu) return;
    const close = (e: MouseEvent) => {
      if (ctxRef.current && !ctxRef.current.contains(e.target as Node)) setCtxMenu(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [ctxMenu]);

  const handlePin = async () => {
    setCtxMenu(null);
    try {
      await api.togglePinChat(chat.id);
      loadChats();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    setCtxMenu(null);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await api.deleteChat(chat.id);
      useChatStore.getState().removeChat(chat.id);
    } catch (e) { console.error(e); }
  };

  const initials = chatName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        {...longPressHandlers}
        className={`w-full flex items-center gap-3 px-3 py-3 transition-colors text-left ${
          isActive ? 'bg-accent/15 border-r-2 border-accent' : 'hover:bg-surface-hover'
        }`}
      >
        {/* Аватар */}
        <div className="relative flex-shrink-0">
          {isFavorites ? (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Bookmark size={22} className="text-white" />
            </div>
          ) : (
            <Avatar src={chatAvatar} name={chatName} size="lg" online={isOnline ? true : undefined} />
          )}
        </div>

        {/* Инфо */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {isPinned && <Pin size={12} className="text-vortex-400 flex-shrink-0 rotate-45" />}
              <span className="text-sm font-medium text-white truncate">{chatName}</span>
            </div>
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0 ml-2">
              {timeStr && (
                <div className="flex items-center gap-1">
                  {isMine && lastMessage && !lastMessage.isDeleted && (
                    <span className="flex-shrink-0">
                      {isRead ? (
                        <CheckCheck size={14} className="text-blue-500" />
                      ) : (
                        <Check size={14} className="text-blue-500" />
                      )}
                    </span>
                  )}
                  <span className="text-xs text-zinc-500">{timeStr}</span>
                </div>
              )}
              {chat.unreadCount > 0 && !isActive && !isMine && (
                <span className="min-w-[20px] h-[20px] px-1.5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-semibold shadow-sm">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            {/* Media thumbnail preview */}
            {!isTyping && !draft && messagePreview.type === 'image' && (
              <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden bg-surface-tertiary">
                <img
                  src={messagePreview.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {!isTyping && !draft && messagePreview.type === 'video' && (
              <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden bg-surface-tertiary relative">
                <img
                  src={messagePreview.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Video size={12} className="text-white" />
                </div>
              </div>
            )}
            {!isTyping && !draft && messagePreview.type === 'icon' && (
              <messagePreview.icon size={14} className="flex-shrink-0 text-zinc-500" />
            )}

            <p className={`text-xs truncate flex-1 min-w-0 ${isTyping ? 'text-vortex-400 font-medium' : draft ? 'text-red-400' : 'text-zinc-400'}`}>
              {isTyping ? (
                <>
                  {chat.type === 'group' && typingInChat[0] && (
                    <span className="font-medium">
                      {chat.members.find(m => m.user.id === typingInChat[0].userId)?.user.displayName?.split(' ')[0] ||
                       chat.members.find(m => m.user.id === typingInChat[0].userId)?.user.username ||
                       'User'}{' '}
                    </span>
                  )}
                  {t('typing')}
                </>
              ) : draft ? (
                <>
                  <span className="font-medium text-red-400">{t('draft')}: </span>
                  {stripMarkdown(draft)}
                </>
              ) : (
                <>
                  {senderName && <span className="font-medium text-white">{senderName}: </span>}
                  {messagePreview.type === 'text' && messagePreview.content}
                  {(messagePreview.type === 'image' || messagePreview.type === 'video') && messagePreview.text}
                  {messagePreview.type === 'icon' && messagePreview.text}
                </>
              )}
            </p>
          </div>
        </div>
      </button>

      {/* Context Menu */}
      {ctxMenu && (
        <div
          ref={ctxRef}
          className="fixed z-[9999] min-w-[180px] py-1 rounded-xl bg-surface-secondary border border-border shadow-xl animate-in fade-in zoom-in-95 duration-100"
          style={{ top: ctxMenu.y, left: ctxMenu.x }}
        >
          <button
            onClick={handlePin}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-surface-hover hover:text-white transition-colors"
          >
            <Pin size={16} className={isPinned ? 'rotate-45' : ''} />
            {isPinned ? t('unpinChat') : t('pinChat')}
          </button>
          <div className="border-t border-border my-1" />
          <button
            onClick={handleDelete}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={16} />
            {t('deleteChat')}
          </button>
        </div>
      )}

      <ConfirmModal
        open={showDeleteConfirm}
        message={t('deleteChatConfirm')}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

export default memo(ChatListItem);
