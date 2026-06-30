import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import errorHandler from './middlewares/errorHandler.js';
import { UPLOAD_DIR } from './middlewares/uploadMiddleware.js';
import { prisma } from './config/db.js';
export { prisma };

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import './events/listeners.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '100kb' })); // JSON body parsing
app.use(cookieParser()); // Parse cookies
app.use(morgan('dev')); // Request logger
app.use(passport.initialize()); // Initialize Passport

// Serve static upload files
app.use('/uploads', express.static(UPLOAD_DIR, {
  fallthrough: false,
  index: false,
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
}));

// Routes
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/users', userRoutes);
app.use('/notifications', notificationRoutes);

// Health check route
app.get('/health', async (req, res, next) => {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Global Error Handler
app.use(errorHandler);

export default app;
