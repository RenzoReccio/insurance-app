import Hapi from '@hapi/hapi';
import HapiJwt from '@hapi/jwt';
import { config } from '../config/env';
import { TokenRequestDto } from '../entities';

export class AuthController {
  generateToken = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const payload = (request.payload as TokenRequestDto) || {};
    const username = payload.username || 'interface.servicios';
    const role = payload.role || 'service';

    const token = HapiJwt.token.generate(
      {
        sub: username,
        username,
        role,
      },
      {
        key: config.jwt.secret,
        algorithm: 'HS256',
      },
      {
        ttlSec: config.jwt.expiresIn,
      }
    );

    return h
      .response({
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: config.jwt.expiresIn,
        user: { username, role },
      })
      .code(200);
  };
}
