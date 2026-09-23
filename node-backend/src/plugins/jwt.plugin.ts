import Hapi from '@hapi/hapi';
import HapiJwt from '@hapi/jwt';
import { config } from '../config/env';

export const registerJwtAuth = async (server: Hapi.Server): Promise<void> => {
  await server.register(HapiJwt);

  server.auth.strategy('jwt', 'jwt', {
    keys: config.jwt.secret,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec: config.jwt.expiresIn,
      timeSkewSec: 15,
    },
    validate: (artifacts: any, _request: Hapi.Request, _h: Hapi.ResponseToolkit) => {
      // Valid if decoded payload has a user or username
      return {
        isValid: true,
        credentials: {
          user: artifacts.decoded.payload.username || artifacts.decoded.payload.sub || 'user',
          scope: artifacts.decoded.payload.scope || artifacts.decoded.payload.role || 'service',
        },
      };
    },
  });

  server.auth.default('jwt');
};
