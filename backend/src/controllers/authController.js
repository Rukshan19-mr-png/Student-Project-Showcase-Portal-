import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { getClearJwtCookieOptions, getJwtCookieOptions, JWT_COOKIE_NAME } from '../utils/cookies.js';
import { validateBody } from '../utils/validation.js';

const mockLoginSchema = z.object({
  email: z.email().trim().toLowerCase().max(254),
  name: z.string().trim().min(1).max(100).optional(),
  role: z.enum(['STUDENT', 'RECRUITER', 'ADMIN']).default('STUDENT'),
});

const getJwtSecret = (name, fallback) => {
  const secret = process.env[name];
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error(`${name} must be configured in production.`);
  }
  return secret || fallback;
};

export const mockLogin = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Mock login is not available in production.' });
    }

    const { email, name, role } = validateBody(mockLoginSchema, req.body);

    // Find user or create if not exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          role,
          googleId: `mock-google-id-${Date.now()}-${Math.floor(Math.random() * 100000)}`
        }
      });
    } else {
      // Role switching is kept to non-production mock auth only.
      if (role && user.role !== role) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role }
        });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getJwtSecret('JWT_SECRET', 'fallback_secret_key'),
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful (mock)',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, getJwtSecret('SESSION_SECRET', 'fallback_session_secret'), {
    expiresIn: '7d',
  });
};

export const googleCallback = (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }

  // Generate JWT token for the user
  const token = generateToken(req.user.id);

  // Set JWT as an HttpOnly cookie
  res.cookie(JWT_COOKIE_NAME, token, getJwtCookieOptions());

  // Redirect to frontend dashboard or home
  res.redirect(`${process.env.FRONTEND_URL}/`);
};

export const getMe = (req, res) => {
  // req.user is set by requireAuth middleware
  res.status(200).json({ user: req.user });
};

export const logout = (req, res) => {
  res.clearCookie(JWT_COOKIE_NAME, getClearJwtCookieOptions());
  res.status(200).json({ message: 'Logged out successfully' });
};
