import express from 'express';
import {
  createProject,
  listProjects,
  getProjectDetail,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', listProjects);
router.get('/:id', getProjectDetail);

// Protected routes (Student only for create)
router.post(
  '/',
  authenticate,
  authorizeRole(['STUDENT']),
  upload.single('thumbnail'),
  createProject
);

// Protected routes (Owning student only for update)
router.put(
  '/:id',
  authenticate,
  upload.single('thumbnail'),
  updateProject
);

// Protected routes (Owning student or admin for delete)
router.delete(
  '/:id',
  authenticate,
  deleteProject
);

export default router;
