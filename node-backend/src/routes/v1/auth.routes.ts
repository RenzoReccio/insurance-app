import { ServerRoute } from '@hapi/hapi';
import { AuthController } from '../../controllers/auth.controller';
import { TokenRequestSchema } from '../../entities';

export const createAuthRoutes = (authController: AuthController): ServerRoute[] => [
  {
    method: 'POST',
    path: '/v1/auth/token',
    options: {
      auth: false,
      description: 'Generates a signed JWT access token for testing and API clients',
      tags: ['api', 'auth'],
      validate: {
        payload: TokenRequestSchema,
        failAction: (_request, _h, err) => {
          throw err;
        },
      },
    },
    handler: authController.generateToken,
  },
];
