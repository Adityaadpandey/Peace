import { PrismaClient } from '@prisma/client';
import { RequestHandler, Router } from 'express';
import { Server as SocketServer } from 'socket.io';

const router = Router();
const prisma = new PrismaClient();

let io: SocketServer; // Will be set when the router is initialized

export const initializeNotificationRouter = (socketIo: SocketServer) => {
  io = socketIo;
  return router;
};

// Types
interface SendNotificationBody {
  userId: string;
  type: 'CHAT_REQUEST' | 'DIAGNOSTIC_READY' | 'POST_LIKED' | 'NEW_FOLLOWER' | 'COMMENT';
  title: string;
  message: string;
  data?: Record<string, any>;
}

// POST /api/notifications/send - Send notifications
const sendNotification: RequestHandler<{}, any, SendNotificationBody> = async (req, res) => {
  const { userId, type, title, message, data } = req.body;

  try {
    // Store notification in database (you'll need to create this model in prisma)
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || {},
      }
    });

    // Emit real-time notification
    io.to(userId).emit('notification', notification);

    res.json(notification);
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

// GET /api/notifications - Retrieve notifications for the logged-in user
const getNotifications: RequestHandler = async (req, res) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        readAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// PUT /api/notifications/:id/read - Mark notification as read
const markAsRead: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        readAt: new Date()
      }
    });

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Register routes
router.post('/send', sendNotification);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

export { router as notificationRoute };
