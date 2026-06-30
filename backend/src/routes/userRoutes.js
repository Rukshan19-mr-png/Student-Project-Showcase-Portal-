import express from 'express';
import { followUser, unfollowUser, getFollowing, getAllUsers, deleteUser } from '../controllers/userController.js';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/following', authenticate, getFollowing);
router.post('/:id/follow', authenticate, followUser);
router.delete('/:id/follow', authenticate, unfollowUser);

// Admin only
router.get('/all', authenticate, authorizeRole(['ADMIN']), getAllUsers);
router.delete('/:id', authenticate, authorizeRole(['ADMIN']), deleteUser);

export default router;
