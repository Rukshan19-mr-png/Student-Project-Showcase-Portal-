import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import errorHandler from './middlewares/errorHandler.js';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json()); // JSON body parsing
app.use(morgan('dev')); // Request logger

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
