import { PrismaClient } from '@prisma/client';
import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

const prisma = new PrismaClient();

export function setupSocketIO(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Socket.IO Events Handler
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a specific chat room
    socket.on('join_room', (sessionId: string) => {
      socket.join(sessionId);
      console.log(`Socket ${socket.id} joined room ${sessionId}`);
    });

    // Handle real-time message sending
    socket.on('send_message', async (data: {
      sessionId: string;
      content: string;
      senderId: string;
      senderRole: 'USER' | 'DOCTOR';
    }) => {
      try {
        // Save message to database
        const message = await prisma.message.create({
          data: {
            content: data.content,
            senderId: data.senderId,
            senderRole: data.senderRole,
            chatSession: { connect: { id: data.sessionId } }
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
          where: { id: data.sessionId },
          data: { messageCount: { increment: 1 } }
        });

        // Emit message to room
        io.to(data.sessionId).emit('receive_message', message);
      } catch (error) {
        console.error('Error handling real-time message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle leaving chat room
    socket.on('leave_room', (sessionId: string) => {
      socket.leave(sessionId);
      console.log(`Socket ${socket.id} left room ${sessionId}`);
    });

    // Handle ending chat session
    socket.on('end_chat', async (sessionId: string) => {
      try {
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { endedAt: new Date() }
        });

        io.to(sessionId).emit('chat_ended', { sessionId });

        // Disconnect all clients from this room
        const sockets = await io.in(sessionId).fetchSockets();
        sockets.forEach(s => s.leave(sessionId));
      } catch (error) {
        console.error('Error ending chat session:', error);
        socket.emit('error', { message: 'Failed to end chat session' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}
