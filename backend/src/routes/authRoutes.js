import express from 'express';
import passport from 'passport';
import { mockLogin, googleCallback, getMe, logout } from '../controllers/authController.js';
import { authenticate, requireAuth } from '../middlewares/authMiddleware.js';
import { authRateLimiter } from '../middlewares/rateLimitMiddleware.js';
import { isGoogleAuthConfigured } from '../config/passport.js';

const router = express.Router();

const requireGoogleAuthConfigured = (req, res, next) => {
  if (!isGoogleAuthConfigured) {
    return res.status(503).json({ error: 'Google OAuth is not configured.' });
  }
  return next();
};

// Mock login route
router.post('/mock-login', authRateLimiter, mockLogin);

// Trigger Google OAuth login
router.get('/google', authRateLimiter, requireGoogleAuthConfigured, passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback', authRateLimiter, requireGoogleAuthConfigured, passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallback);

// Get current user (protected route)
router.get('/me', requireAuth, getMe);

// Logout route
router.post('/logout', authenticate, logout);

export default router;
