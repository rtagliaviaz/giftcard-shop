// @ts-nocheck
import { jest } from '@jest/globals';

// Mock dependencies
await jest.unstable_mockModule('../db/init', () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
}));

await jest.unstable_mockModule('../services/eventListener', () => ({
  startEventListener: jest.fn(),
}));

await jest.unstable_mockModule('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  })),
}));

await jest.unstable_mockModule('../config', () => ({
  default: {
    clientUrl: 'http://localhost:3000',
    port: 0,
  },
}));

// Import after mocks
const { initializeDatabase } = await import('../db/init');
const { startEventListener } = await import('../services/eventListener');
const { Server: SocketServer } = await import('socket.io');
const { startServer } = await import('../server');

describe('startServer', () => {
  let server;

  afterEach(async () => {
    if (server && server.close) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('should initialize database, start event listener, create HTTP server and Socket.IO', async () => {
    server = await startServer();

    expect(initializeDatabase).toHaveBeenCalled();
    expect(startEventListener).toHaveBeenCalled();
    expect(SocketServer).toHaveBeenCalled();
    expect(server.listening).toBe(true);
  });
});