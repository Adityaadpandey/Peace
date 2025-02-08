import { PrismaClient } from '@prisma/client';
import { RequestHandler, Router } from 'express';

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/users - Fetch all registered users
const getUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        isAnonymous: true,
        createdAt: true,
        age: true,
        gender: true,
        avatar: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
        _count: {
          select: {
            chatSessions: true,
            medicalHistory: true
          }
        }
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// GET /api/admin/doctors - Fetch all registered doctors
const getDoctors: RequestHandler = async (_req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        name: true,
        speciality: true,
        isAvailable: true,
        createdAt: true,
        postsCount: true,
        verifiedPostCount: true,
        _count: {
          select: {
            chatSessions: true,
            diagnostics: true
          }
        }
      }
    });

    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

// DELETE /api/admin/chat/:sessionId - Force-delete a chat session
const deleteChatSession: RequestHandler<{ sessionId: string }> = async (req, res) => {
  const { sessionId } = req.params;

  try {
    // Delete associated messages and diagnostic report first
    await prisma.$transaction([
      prisma.message.deleteMany({
        where: { chatSessionId: sessionId }
      }),
      prisma.diagnosticReport.deleteMany({
        where: { chatSessionId: sessionId }
      }),
      prisma.chatSession.delete({
        where: { id: sessionId }
      })
    ]);

    res.json({ message: 'Chat session and related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
};

// Register routes
router.get('/users', getUsers);
router.get('/doctors', getDoctors);
router.delete('/chat/:sessionId', deleteChatSession);

export { router as adminRoute };
