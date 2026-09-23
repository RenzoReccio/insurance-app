import { ServerRoute } from '@hapi/hapi';
import { EndorseController } from '../../controllers/endorse.controller';
import { EndorseRequestSchema } from '../../entities';

export const createEndorseRoutes = (endorseController: EndorseController): ServerRoute[] => [
  {
    method: 'POST',
    path: '/v1/endorse/translate',
    options: {
      auth: 'jwt',
      description: 'Translates flat endorsement JSON to Core structured JSON',
      tags: ['api', 'endorsement'],
      validate: {
        payload: EndorseRequestSchema,
        failAction: (_request, _h, err) => {
          throw err;
        },
      },
    },
    handler: endorseController.translate,
  },
  {
    // Alias to support the prompt's exact endpoint without version prefix
    method: 'POST',
    path: '/endorse/translate',
    options: {
      auth: 'jwt',
      description: 'Translates flat endorsement JSON to Core structured JSON (legacy alias)',
      tags: ['api', 'endorsement'],
      validate: {
        payload: EndorseRequestSchema,
        failAction: (_request, _h, err) => {
          throw err;
        },
      },
    },
    handler: endorseController.translate,
  },
];
