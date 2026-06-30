import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { JWT_COOKIE_NAME } from '../utils/cookies.js';

const getJwtSecret = (name, fallback) => {
  const secret = process.env[name];
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error(`${name} must be configured in production.`);
  }
  return secret || fallback;
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;
    let secret = null;
    let userIdField = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Bearer token from Authorization header (e.g. mock-login flow)
      token = authHeader.split(' ')[1];
      secret = getJwtSecret('JWT_SECRET', 'fallback_secret_key');
      userIdField = 'id';
    } else if (req.cookies?.[JWT_COOKIE_NAME]) {
      // Fall back to HttpOnly cookie (Google OAuth flow sets this)
      token = req.cookies[JWT_COOKIE_NAME];
      secret = getJwtSecret('SESSION_SECRET', 'fallback_session_secret');
      userIdField = 'userId';
    }

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded[userIdField] }
    });

    if (!user) {
      return res.status(401).json({ error: 'User associated with this token not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies[JWT_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, getJwtSecret('SESSION_SECRET', 'fallback_session_secret'));
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Support both single role string or array of roles
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission to perform this action.' });
    }
    next();
  };
};
