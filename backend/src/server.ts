import app from './app';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import config from './config';
import { startEventListeners } from './services/eventListener';
import { initializeDatabase } from './db/init';
import { SOCKET_EVENTS } from './constants/socketEvents';

export async function startServer() {
  await initializeDatabase();

  const server = http.createServer(app);
  const io = new SocketServer(server, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
    },
  });

  (global as any).io = io;

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log('New client connected:', socket.id);
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  startEventListeners();

  const PORT = config.port;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  return server;
}