import { PrismaClient } from '@prisma/client';
import { RequestHandler, Router } from 'express';

const router = Router();
const prisma = new PrismaClient();

// Types
interface StartChatBody {
  userId: string;
  doctorId: string;
}

interface SendMessageBody {
  content: string;
  senderId: string;
  senderRole: 'USER' | 'DOCTOR';
}

// POST /api/chat/start - Start a new chat session
const startChat: RequestHandler<{}, any, StartChatBody> = async (req, res) => {
  const { userId, doctorId } = req.body;

  try {
    const chatSession = await prisma.chatSession.create({
      data: {
        userId,
        doctorId,
      },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          }
        },
        doctor: {
          select: {
            name: true,
            avatar: true,
          }
        }
      }
    });

    res.json(chatSession);
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
};

// GET /api/chat/:sessionId/messages - Fetch all messages for a chat session
const getMessages: RequestHandler<{ sessionId: string }> = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { chatSessionId: sessionId },
      orderBy: { timestamp: 'asc' },
      include: {
        chatSession: {
          select: {
            user: {
              select: {
                username: true,
                avatar: true,
              }
            },
            doctor: {
              select: {
                name: true,
                avatar: true,
              }
            }
          }
        }
      }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// POST /api/chat/:sessionId/message - Save a message
const saveMessage: RequestHandler<{ sessionId: string }, any, SendMessageBody> = async (req, res) => {
  const { sessionId } = req.params;
  const { content, senderId, senderRole } = req.body;

  try {
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        senderRole,
        chatSession: { connect: { id: sessionId } }
      },
      include: {
        chatSession: {
          select: {
            user: {
              select: {
                username: true,
                avatar: true,
              }
            },
            doctor: {
              select: {
                name: true,
                avatar: true,
              }
            }
          }
        }
      }
    });

    // Update message count
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { messageCount: { increment: 1 } }
    });

    res.json(message);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
};

// POST /api/chat/:sessionId/end - End a chat session
const endChat: RequestHandler<{ sessionId: string }> = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const endedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    res.json(endedSession);
  } catch (error) {
    console.error('Error ending chat session:', error);
    res.status(500).json({ error: 'Failed to end chat session' });
  }
};

// Register routes
router.post('/start', startChat);
router.get('/:sessionId/messages', getMessages);
router.post('/:sessionId/message', saveMessage);
router.post('/:sessionId/end', endChat);

export { router as chatRoute };
