import { Router } from 'express';
import { verifyPassword } from '../utils/crypto.js';
import { db } from '../db.js';
import { signJwt } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid email or password format' });
  }

  const { email, password } = parsed.data;

  // Find user and join with Role
  const stmt = db.prepare(`
    SELECT Users.*, Roles.name as roleName
    FROM Users
    JOIN Roles ON Users.roleId = Roles.id
    WHERE Users.email = ?
  `);
  const user = stmt.get(email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signJwt({
    userId: user.id,
    email: user.email,
    role: user.roleName
  });

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roleName
    }
  });
});

router.get('/me', authenticate, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.json({ user: req.user });
});

export default router;
