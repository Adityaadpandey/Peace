import { clerkClient, ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

const prisma = new PrismaClient();

// Extend Express Request type to include auth info
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        clerkId: string;
        isDoctor: boolean;
        role?: string;
      };
    }
  }
}

// Base authentication middleware
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Use Clerk's built-in middleware
    ClerkExpressRequireAuth()(req, res, async () => {
      try {
        if (!req.auth?.userId) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        const clerkId = req.auth.userId;

        // Get user's metadata from Clerk
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const role = clerkUser.publicMetadata.role as string | undefined;

        // Check if user exists in our database
        const [user, doctor] = await Promise.all([
          prisma.user.findUnique({ where: { clerkId } }),
          prisma.doctor.findUnique({ where: { clerkId } })
        ]);

        if (!user && !doctor) {
          res.status(404).json({ error: 'User not found in database' });
          return;
        }

        // Add custom auth info to request object
        req.auth = {
          userId: user?.id || doctor?.id || '',
          clerkId,
          isDoctor: !!doctor,
          role
        };

        next();
      } catch (error) {
        console.error('Database auth error:', error);
        res.status(500).json({ error: 'Internal authentication error' });
      }
    });
  } catch (error) {
    console.error('Clerk auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to ensure user is a doctor
export const requireDoctor = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.auth?.isDoctor) {
    res.status(403).json({ error: 'Doctor access required' });
    return;
  }
  next();
};

// Middleware to ensure user is an admin
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.auth?.clerkId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.auth.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};
