import app from './app';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import config from './config';
import { startEventListeners } from './services/eventListener';
import { initializeDatabase } from './db/init';
import { registerSocketHandlers } from './socket/handlers';

export async function startServer() {
  await initializeDatabase();

  const server = http.createServer(app);
  const io = new SocketServer(server, {
    cors: {
      origin: [config.clientUrl as string],
      methods: ['GET', 'POST'],
    },
  });

  (global as any).io = io;

  registerSocketHandlers(io);

  startEventListeners();

  const PORT = config.port;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  return server;
}