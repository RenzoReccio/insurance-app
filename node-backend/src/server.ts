import 'reflect-metadata';
import Hapi from '@hapi/hapi';
import { config } from './config/env';
import { initializeDatabase, AppDataSource } from './config/database';
import { registerJwtAuth } from './plugins/jwt.plugin';
import { registerErrorHandler } from './plugins/error-handler.plugin';
import { registerRoutes } from './routes';
import { seedDatabase } from './scripts/seed';

export const createServer = async (): Promise<Hapi.Server> => {
  const server = Hapi.server({
    port: config.port,
    host: config.host,
    routes: {
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
        credentials: true,
      },
    },
  });

  // 1. Initialize Database connection
  const dataSource = await initializeDatabase();

  // 2. Register Plugins & Middlewares
  await registerJwtAuth(server);
  registerErrorHandler(server);

  // 3. Register Application Routes
  registerRoutes(server, dataSource);

  return server;
};

export const startServer = async (): Promise<Hapi.Server> => {
  const server = await createServer();
  await server.start();
  console.log(`[Server] Hapi server running on ${server.info.uri}`);

  // Auto-seed for quick start if in development
  if (config.env === 'development') {
    try {
      await seedDatabase();
    } catch (seedErr) {
      console.warn('[Server] Auto-seed error (non-fatal):', (seedErr as Error).message);
    }
  }

  return server;
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error('[Server] Fatal bootstrap error:', err);
    process.exit(1);
  });
}
