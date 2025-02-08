import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
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

// Routes
app.get('/', (req, res) => {
  res.send('Hello! Welcome to the Medical Chat API');
});

// API Routes
app.use('/api/user', userRoute);
app.use('/api/doctor', doctorRoute);
app.use('/api/chat', chatRoute);
app.use('/api/diagnostic', diagnosticRoute);
app.use('/api/social', socialRoute);
app.use('/api/admin', adminRoute);
app.use('/api/notifications', notificationRouter);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('WebSocket server is ready for connections');
});
