import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getEnv } from '../lib/env.js';
import { UnauthorizedError } from '../lib/errors.js';
import { hashApiToken, isApiToken } from '../services/api-token.js';

export interface JwtPayload {
  userId: string;
  suiAddress: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    authMethod?: 'jwt' | 'api_token';
    apiTokenId?: string;
  }
}

export default fp(async (app: FastifyInstance) => {
  const env = getEnv();

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: '7d' },
  });

  app.decorate('authenticate', async (req: FastifyRequest) => {
    const authHeader = req.headers.authorization;
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null;

    if (bearer && isApiToken(bearer)) {
      const tokenHash = hashApiToken(bearer);
      const token = await app.prisma.apiToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (!token || token.revokedAt) {
        throw new UnauthorizedError('Invalid or revoked API token');
      }

      req.user = { userId: token.userId, suiAddress: token.user.suiAddress };
      req.authMethod = 'api_token';
      req.apiTokenId = token.id;

      // Update lastUsedAt async (fire-and-forget)
      app.prisma.apiToken
        .update({ where: { id: token.id }, data: { lastUsedAt: new Date() } })
        .catch((err) => app.log.warn({ err }, 'Failed to update apiToken.lastUsedAt'));
      return;
    }

    try {
      await req.jwtVerify();
      req.authMethod = 'jwt';
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  });
});
