import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { HttpError } from '../lib/errors.js';

export default fp(async (app: FastifyInstance) => {
  app.setErrorHandler((error, _req, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
        code: error.code,
      });
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.flatten().fieldErrors,
      });
    }

    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode && err.statusCode < 500) {
      return reply.status(err.statusCode).send({
        success: false,
        error: err.message ?? 'Error',
      });
    }

    app.log.error({ err: error }, 'Unhandled error');
    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
    });
  });
});
