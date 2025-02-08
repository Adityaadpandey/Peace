import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { requireAdmin, requireAuth } from './middleware/auth';
import { adminRoute } from './router/admin';
import { chatRoute } from './router/chat';
import { diagnosticRoute } from './router/diagnostic';
import { doctorRoute } from './router/doctor';
import { initializeNotificationRouter } from './router/notification';
import { socialRoute } from './router/social';
import { userRoute } from './router/user';
import { setupSocketIO } from './socket/chatHandler';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = setupSocketIO(httpServer);

// Initialize notification router with socket.io instance
const notificationRouter = initializeNotificationRouter(io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route - unprotected
app.get('/', (req, res) => {
  res.send('Medical Chat API is running');
});

// Protected API Routes - require authentication
app.use('/api/user', requireAuth, userRoute);
app.use('/api/doctor', requireAuth, doctorRoute);
app.use('/api/chat', requireAuth, chatRoute);
app.use('/api/diagnostic', requireAuth, diagnosticRoute);
app.use('/api/social', requireAuth, socialRoute);
app.use('/api/notifications', requireAuth, notificationRouter);

// Admin routes - require admin role
app.use('/api/admin', requireAuth, requireAdmin, adminRoute);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('WebSocket server is ready for connections');
});
