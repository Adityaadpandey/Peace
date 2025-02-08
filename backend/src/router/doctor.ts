import { PrismaClient } from '@prisma/client';
import { RequestHandler, Router } from 'express';

const router = Router();
const prisma = new PrismaClient();

// Types
interface DoctorParams {
  id: string;
}

interface AvailabilityBody {
  doctorId: string;
  isAvailable: boolean;
}

// GET /api/doctors - Fetch all doctors
const getDoctors: RequestHandler = async (_req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        name: true,
        speciality: true,
        isAvailable: true,
        bio: true,
        avatar: true,
        postsCount: true,
        verifiedPostCount: true,
      }
    });
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

// GET /api/doctor/:id - Fetch specific doctor
const getDoctorById: RequestHandler<DoctorParams> = async (req, res) => {
  const { id } = req.params;

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        speciality: true,
        isAvailable: true,
        bio: true,
        avatar: true,
        postsCount: true,
        verifiedPostCount: true,
        posts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            category: true,
            likesCount: true,
            commentsCount: true,
          }
        }
      }
    });

    if (!doctor) {
      res.status(404).json({ error: 'Doctor not found' });
      return;
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor details' });
  }
};

// PUT /api/doctor/availability - Update doctor's availability
const updateAvailability: RequestHandler<{}, any, AvailabilityBody> = async (req, res) => {
  const { doctorId, isAvailable } = req.body;

  if (!doctorId || typeof isAvailable !== 'boolean') {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  try {
    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: { isAvailable },
      select: {
        id: true,
        name: true,
        isAvailable: true,
      }
    });

    res.json(updatedDoctor);
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

// Register routes
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/availability', updateAvailability);

export { router as doctorRoute };
