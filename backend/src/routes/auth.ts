import { Router } from 'express';
import { verifyPassword } from '../services/password.js';
import { signAccess, signRefresh, verifyRefresh, verifyAccess } from '../services/tokenService.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  storeRefreshToken,
  consumeRefreshToken,
  revokeAllRefreshTokensForUser,
  type User,
  type Role,
} from '../store/authStore.js';
import { authGuard } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validateBodyJoi } from '../middleware/validateRequest.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { registerSchemaJoi, loginSchemaJoi, refreshSchemaJoi } from '../validation/joiSchemas.js';
import { sanitizeUserInput } from '../lib/sanitize.js';

const router = Router();

function toUserResponse(u: User) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  };
}

router.post('/register', authLimiter, validateBodyJoi(registerSchemaJoi), asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.validated!.body as { name: string; email: string; password: string; role: Role };
  const safeName = sanitizeUserInput(name, 200);
  try {
    const user = await createUser(safeName, email, password, role ?? 'user');
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);
    storeRefreshToken(refreshToken, user.id);
    res.status(201).json({
      user: toUserResponse(user),
      accessToken,
      refreshToken,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Registration failed';
    res.status(400).json({ message: msg });
  }
}));

router.post('/login', authLimiter, validateBodyJoi(loginSchemaJoi), asyncHandler(async (req, res) => {
  const { email, password } = req.validated!.body as { email: string; password: string };
  const user = findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }
  if (user.blocked === true) {
    res.status(403).json({ message: 'Account is blocked' });
    return;
  }
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);
  storeRefreshToken(refreshToken, user.id);
  res.json({
    user: toUserResponse(user),
    accessToken,
    refreshToken,
  });
}));

router.post('/refresh', validateBodyJoi(refreshSchemaJoi), asyncHandler(async (req, res) => {
  const { refreshToken } = req.validated!.body as { refreshToken: string };
  try {
    const payload = verifyRefresh(refreshToken);
    const userId = consumeRefreshToken(refreshToken);
    if (!userId || userId !== payload.id) {
      res.status(401).json({ message: 'Invalid or reused refresh token' });
      return;
    }
    const user = findUserById(userId);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    const newPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = signAccess(newPayload);
    const newRefreshToken = signRefresh(newPayload);
    storeRefreshToken(newRefreshToken, user.id);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
}));

router.post('/logout', (req, res) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccess(auth.slice(7));
      revokeAllRefreshTokensForUser(payload.id);
    } catch {
      // ignore invalid token
    }
  }
  res.status(204).send();
});

router.get('/me', authGuard, (req, res) => {
  const user = findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json(toUserResponse(user));
});

export default router;
