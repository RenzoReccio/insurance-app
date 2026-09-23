import Hapi from '@hapi/hapi';
import Boom from '@hapi/boom';

export const registerErrorHandler = (server: Hapi.Server): void => {
  server.ext('onPreResponse', (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const response = request.response;

    if (Boom.isBoom(response)) {
      const statusCode = response.output.statusCode;
      const errorPayload = {
        statusCode,
        error: response.output.payload.error,
        message: response.message,
        timestamp: new Date().toISOString(),
        path: request.path,
      };

      return h.response(errorPayload).code(statusCode);
    }

    return h.continue;
  });
};
