import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { verifyWalletSignature } from '../services/sui.js';
import { BadRequestError, UnauthorizedError } from '../lib/errors.js';

const NONCE_PREFIX = 'auth:nonce:';
const NONCE_TTL_SECONDS = 300; // 5 min

const requestChallengeSchema = z.object({
  suiAddress: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid Sui address'),
});

const verifyChallengeSchema = z.object({
  suiAddress: z.string().regex(/^0x[a-fA-F0-9]+$/),
  signature: z.string().min(1),
  displayName: z.string().optional(),
});

export default async function authRoutes(app: FastifyInstance) {
  // 1) Request a one-time challenge message to sign
  app.post('/auth/challenge', async (req) => {
    const { suiAddress } = requestChallengeSchema.parse(req.body);

    const nonce = randomUUID();
    const message = `DevMind login\nAddress: ${suiAddress}\nNonce: ${nonce}\nIssued: ${new Date().toISOString()}`;

    await app.redis.set(NONCE_PREFIX + suiAddress, message, 'EX', NONCE_TTL_SECONDS);

    return { success: true, data: { message } };
  });

  // 2) Verify signature and issue JWT
  app.post('/auth/verify', async (req) => {
    const body = verifyChallengeSchema.parse(req.body);

    const stored = await app.redis.get(NONCE_PREFIX + body.suiAddress);
    if (!stored) throw new BadRequestError('Challenge expired or not found. Request a new one.');

    const isValid = await verifyWalletSignature(stored, body.signature, body.suiAddress);
    if (!isValid) throw new UnauthorizedError('Invalid signature');

    await app.redis.del(NONCE_PREFIX + body.suiAddress);

    let user = await app.prisma.user.findUnique({ where: { suiAddress: body.suiAddress } });
    if (!user) {
      user = await app.prisma.user.create({
        data: {
          suiAddress: body.suiAddress,
          displayName: body.displayName ?? null,
        },
      });
    } else if (body.displayName && body.displayName !== user.displayName) {
      user = await app.prisma.user.update({
        where: { id: user.id },
        data: { displayName: body.displayName },
      });
    }

    const token = app.jwt.sign({ userId: user.id, suiAddress: user.suiAddress });

    return {
      success: true,
      data: {
        token,
        user: { id: user.id, suiAddress: user.suiAddress, displayName: user.displayName },
      },
    };
  });

  // 3) Get current user info
  app.get('/auth/me', { onRequest: [app.authenticate] }, async (req) => {
    const user = await app.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) throw new UnauthorizedError('User not found');
    return {
      success: true,
      data: { id: user.id, suiAddress: user.suiAddress, displayName: user.displayName },
    };
  });
}
