import { Router } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/auth';
import { USER_SELECT, SENDER_SELECT, uploadUserAvatar, deleteUploadedFile, encryptUploadedFile } from '../shared';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId, isCloudinaryUrl } from '../cloudinary';
import fs from 'fs';

const router = Router();

// Поиск пользователей
router.get('/search', async (req: AuthRequest, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim().length < 3) {
      res.json([]);
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q } },
          { displayName: { contains: q } },
        ],
        NOT: { id: req.userId },
      },
      select: USER_SELECT,
      take: 20,
    });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Профиль пользователя
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      select: USER_SELECT,
    });

    if (!user) {
      res.status(404).json({ error: 'Пользователь не найден' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Загрузить аватар
router.post('/avatar', uploadUserAvatar.single('avatar'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Файл не загружен' });
      return;
    }

    // Delete old avatar from Cloudinary if exists
    const currentUser = await prisma.user.findUnique({ where: { id: req.userId }, select: { avatar: true } });
    if (currentUser?.avatar && isCloudinaryUrl(currentUser.avatar)) {
      const publicId = extractPublicId(currentUser.avatar);
      if (publicId) await deleteFromCloudinary(publicId);
    }

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file.path, 'avatars');

    // Delete local file after successful upload
    fs.unlinkSync(req.file.path);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: cloudinaryResult.url },
      select: USER_SELECT,
    });

    res.json(user);
  } catch (error) {
    console.error('Avatar upload error:', error);
    // Clean up local file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Ошибка загрузки аватара' });
  }
});

// Удалить аватар
router.delete('/avatar', async (req: AuthRequest, res) => {
  try {
    // Delete file from disk
    const currentUser = await prisma.user.findUnique({ where: { id: req.userId }, select: { avatar: true } });
    if (currentUser?.avatar) deleteUploadedFile(currentUser.avatar);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: null },
      select: USER_SELECT,
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления аватара' });
  }
});

// Обновить профиль (username НЕ меняется!)
router.put('/profile', async (req: AuthRequest, res) => {
  try {
    const { displayName, bio, birthday } = req.body;

    // Validate field lengths
    if (displayName !== undefined && (typeof displayName !== 'string' || displayName.length === 0 || displayName.length > 50)) {
      res.status(400).json({ error: 'Имя должно быть от 1 до 50 символов' });
      return;
    }
    if (bio !== undefined && bio !== null && (typeof bio !== 'string' || bio.length > 500)) {
      res.status(400).json({ error: 'Био должно быть не длиннее 500 символов' });
      return;
    }
    if (birthday !== undefined && birthday !== null) {
      if (typeof birthday !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthday) || isNaN(Date.parse(birthday))) {
        res.status(400).json({ error: 'Некорректный формат даты рождения (YYYY-MM-DD)' });
        return;
      }
    }

    const updateData: Record<string, string | null> = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (birthday !== undefined) updateData.birthday = birthday;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: USER_SELECT,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Поиск сообщений
router.get('/messages/search', async (req: AuthRequest, res) => {
  try {
    const { q, chatId } = req.query;
    if (!q || typeof q !== 'string') {
      res.json([]);
      return;
    }

    const where: Record<string, unknown> = {
      content: { contains: q },
      isDeleted: false,
    };

    if (chatId) {
      where.chatId = chatId;
      const member = await prisma.chatMember.findUnique({
        where: { chatId_userId: { chatId: chatId as string, userId: req.userId! } },
      });
      if (member?.clearedAt) {
        where.createdAt = { gt: member.clearedAt };
      }
    } else {
      where.chat = {
        members: { some: { userId: req.userId } },
      };
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: { select: SENDER_SELECT },
        chat: {
          select: {
            id: true,
            name: true,
            type: true,
            members: {
              include: {
                user: { select: { id: true, username: true, displayName: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // For global search (no chatId filter), filter out messages before clearedAt per chat
    let filtered = messages;
    if (!chatId) {
      const memberships = await prisma.chatMember.findMany({
        where: { userId: req.userId! },
        select: { chatId: true, clearedAt: true },
      });
      const clearedMap = new Map<string, Date>();
      for (const m of memberships) {
        if (m.clearedAt) clearedMap.set(m.chatId, m.clearedAt);
      }
      if (clearedMap.size > 0) {
        filtered = messages.filter((msg) => {
          const cleared = clearedMap.get(msg.chatId);
          if (!cleared) return true;
          return new Date(msg.createdAt) > new Date(cleared);
        });
      }
    }

    res.json(filtered);
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить настройки приватности
router.put('/settings', async (req: AuthRequest, res) => {
  try {
    const { hideStoryViews } = req.body;

    const updateData: Record<string, boolean> = {};
    if (typeof hideStoryViews === 'boolean') updateData.hideStoryViews = hideStoryViews;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: USER_SELECT,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сохранения настроек' });
  }
});

// Обновить настройки оформления
router.put('/appearance', async (req: AuthRequest, res) => {
  try {
    const { appTheme, nightMode, nightStartTime, nightEndTime, textSize, messageRadius, chatTheme, chatWallpaper, accentColor } = req.body;

    const updateData: Record<string, any> = {};
    if (appTheme && ['light', 'dark'].includes(appTheme)) updateData.appTheme = appTheme;
    if (nightMode && ['system', 'off', 'scheduled', 'auto'].includes(nightMode)) updateData.nightMode = nightMode;
    if (nightStartTime && typeof nightStartTime === 'string') updateData.nightStartTime = nightStartTime;
    if (nightEndTime && typeof nightEndTime === 'string') updateData.nightEndTime = nightEndTime;
    if (typeof textSize === 'number' && textSize >= 0.8 && textSize <= 1.2) updateData.textSize = textSize;
    if (typeof messageRadius === 'number' && messageRadius >= 0 && messageRadius <= 24) updateData.messageRadius = messageRadius;
    if (chatTheme && typeof chatTheme === 'string') updateData.chatTheme = chatTheme;
    if (chatWallpaper !== undefined) updateData.chatWallpaper = chatWallpaper; // null is valid
    if (accentColor && typeof accentColor === 'string') updateData.accentColor = accentColor;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: USER_SELECT,
    });

    res.json(user);
  } catch (error) {
    console.error('Appearance settings error:', error);
    res.status(500).json({ error: 'Ошибка сохранения настроек оформления' });
  }
});

export default router;
