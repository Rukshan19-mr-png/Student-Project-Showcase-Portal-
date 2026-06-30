import { z } from 'zod';
import { prisma } from '../config/db.js';
import { formatZodIssues, paginationSchema, uuidSchema } from '../utils/validation.js';

const notificationIdParamsSchema = z.object({
  id: uuidSchema,
});

/**
 * GET /notifications
 * Retrieve the current user's notifications, newest first, paginated.
 */
export const getNotifications = async (req, res, next) => {
  try {
    const validation = paginationSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid query parameters.',
        details: formatZodIssues(validation.error)
      });
    }

    const { page, limit } = validation.data;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          }
        }
      }),
      prisma.notification.count({
        where: { userId: req.user.id }
      })
    ]);

    res.status(200).json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /notifications/:id/read
 * Mark a single notification as read.
 */
export const markAsRead = async (req, res, next) => {
  try {
    const validation = notificationIdParamsSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request parameters.',
        details: formatZodIssues(validation.error)
      });
    }

    const { id } = validation.data;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You do not own this notification.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /notifications/read-all
 * Mark all notifications of the current user as read.
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.status(200).json({
      message: 'All notifications marked as read',
      count: result.count
    });
  } catch (error) {
    next(error);
  }
};
