import Hapi, { ServerRoute } from '@hapi/hapi';
import { DataSource } from 'typeorm';
import { AuthController } from '../controllers/auth.controller';
import { EndorseController } from '../controllers/endorse.controller';
import { EndorsementTranslatorService } from '../services/endorse-translator.service';
import { TemplateRepository } from '../repositories/template.repository';
import { EndorsementCoreMapper } from '../mappers/endorse-core.mapper';
import { ConsoleEventPublisher } from '../publishers/console-event.publisher';
import { createAuthRoutes } from './v1/auth.routes';
import { createEndorseRoutes } from './v1/endorse.routes';

export const registerRoutes = (server: Hapi.Server, dataSource: DataSource): void => {
  // Dependency Injection / Composition Root
  const templateRepo = new TemplateRepository(dataSource);
  const mapper = new EndorsementCoreMapper();
  const publisher = new ConsoleEventPublisher();
  const translatorService = new EndorsementTranslatorService(templateRepo, mapper, publisher);

  const authController = new AuthController();
  const endorseController = new EndorseController(translatorService);

  // Health route
  const healthRoute: ServerRoute = {
    method: 'GET',
    path: '/health',
    options: {
      auth: false,
      description: 'Liveness and database healthcheck endpoint',
    },
    handler: async (_request, h) => {
      const isDbConnected = dataSource.isInitialized;
      return h
        .response({
          status: isDbConnected ? 'UP' : 'DEGRADED',
          timestamp: new Date().toISOString(),
          database: isDbConnected ? 'connected' : 'disconnected',
        })
        .code(isDbConnected ? 200 : 503);
    },
  };

  const routes: ServerRoute[] = [
    healthRoute,
    ...createAuthRoutes(authController),
    ...createEndorseRoutes(endorseController),
  ];

  server.route(routes);
};
