import express from 'express';
import passport from 'passport';
import { mockLogin, googleCallback, getMe, logout, signup, login } from '../controllers/authController.js';
import { authenticate, requireAuth } from '../middlewares/authMiddleware.js';
import { authRateLimiter } from '../middlewares/rateLimitMiddleware.js';
import { isGoogleAuthConfigured } from '../config/passport.js';

const router = express.Router();

// Email/Password Auth routes
router.post('/signup', authRateLimiter, signup);
router.post('/login', authRateLimiter, login);

// Auth configuration status (public — used by the frontend to conditionally show Google button)
router.get('/status', (req, res) => {
  res.json({ googleAuthEnabled: isGoogleAuthConfigured });
});

const requireGoogleAuthConfigured = (req, res, next) => {
  if (!isGoogleAuthConfigured) {
    return res.status(503).json({ error: 'Google OAuth is not configured.' });
  }
  return next();
};

// Mock login route deactivated

// Trigger Google OAuth login
router.get('/google', authRateLimiter, requireGoogleAuthConfigured, passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback — failureRedirect must be an absolute URL to the frontend
router.get(
  '/google/callback',
  authRateLimiter,
  requireGoogleAuthConfigured,
  (req, res, next) => {
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    })(req, res, next);
  },
  googleCallback
);

// Get current user (protected route)
router.get('/me', requireAuth, getMe);

// Logout route
router.post('/logout', authenticate, logout);

export default router;
