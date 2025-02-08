import { PrismaClient } from '@prisma/client';
import { RequestHandler, Router } from 'express';

const router = Router();
const prisma = new PrismaClient();

// Types
interface ValidateReportBody {
  doctorNotes: string;
  validatedById: string;
}

// POST /api/diagnostic/:sessionId - Generate diagnostic report
const generateDiagnostic: RequestHandler<{ sessionId: string }> = async (req, res) => {
  const { sessionId } = req.params;

  try {
    // First, fetch all messages from the chat session
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          select: {
            content: true,
            senderRole: true
          }
        }
      }
    });

    if (!chatSession) {
      res.status(404).json({ error: 'Chat session not found' });
      return;
    }

    // TODO: Integrate with Gemini API
    // For now, create a placeholder analysis
    const aiAnalysis = "This is a placeholder for AI-generated diagnostic analysis. Integrate with Gemini API.";

    // Create diagnostic report
    const report = await prisma.diagnosticReport.create({
      data: {
        chatSession: { connect: { id: sessionId } },
        aiAnalysis,
        validatedBy: { connect: { id: chatSession.doctorId } } // Connect with the session's doctor
      }
    });

    res.json(report);
  } catch (error) {
    console.error('Error generating diagnostic report:', error);
    res.status(500).json({ error: 'Failed to generate diagnostic report' });
  }
};

// GET /api/diagnostic/:sessionId - Retrieve diagnostic report
const getDiagnostic: RequestHandler<{ sessionId: string }> = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const report = await prisma.diagnosticReport.findUnique({
      where: { chatSessionId: sessionId },
      include: {
        chatSession: {
          select: {
            startedAt: true,
            endedAt: true,
            user: {
              select: {
                username: true,
                age: true,
                gender: true
              }
            },
            doctor: {
              select: {
                name: true,
                speciality: true
              }
            }
          }
        },
        validatedBy: {
          select: {
            name: true,
            speciality: true
          }
        }
      }
    });

    if (!report) {
      res.status(404).json({ error: 'Diagnostic report not found' });
      return;
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching diagnostic report:', error);
    res.status(500).json({ error: 'Failed to fetch diagnostic report' });
  }
};

// PUT /api/diagnostic/:sessionId/validate - Doctor validates report
const validateDiagnostic: RequestHandler<{ sessionId: string }, any, ValidateReportBody> = async (req, res) => {
  const { sessionId } = req.params;
  const { doctorNotes, validatedById } = req.body;

  try {
    const updatedReport = await prisma.diagnosticReport.update({
      where: { chatSessionId: sessionId },
      data: {
        doctorNotes,
        isValidated: true,
        validatedBy: { connect: { id: validatedById } }
      },
      include: {
        chatSession: {
          select: {
            user: {
              select: {
                username: true
              }
            },
            doctor: {
              select: {
                name: true
              }
            }
          }
        },
        validatedBy: {
          select: {
            name: true,
            speciality: true
          }
        }
      }
    });

    res.json(updatedReport);
  } catch (error) {
    console.error('Error validating diagnostic report:', error);
    res.status(500).json({ error: 'Failed to validate diagnostic report' });
  }
};

// Register routes
router.post('/:sessionId', generateDiagnostic);
router.get('/:sessionId', getDiagnostic);
router.put('/:sessionId/validate', validateDiagnostic);

export { router as diagnosticRoute };
