import { z } from 'zod';
import { prisma } from '../config/db.js';
import { appEvents } from '../events/eventEmitter.js';
import { formatZodIssues, uuidSchema } from '../utils/validation.js';

const userIdParamsSchema = z.object({
  id: uuidSchema,
});

// POST /users/:id/follow
export const followUser = async (req, res, next) => {
  try {
    const validation = userIdParamsSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request parameters.',
        details: formatZodIssues(validation.error)
      });
    }

    const followedId = validation.data.id;
    const followerId = req.user.id;

    if (followedId === followerId) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followedId }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User to follow not found.' });
    }

    // Check if relationship already exists
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followedId: {
          followerId,
          followedId
        }
      }
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'You are already following this user.' });
    }

    // Create follow relationship
    await prisma.follower.create({
      data: {
        followerId,
        followedId
      }
    });

    // Emit event
    appEvents.emit('UserFollowed', { followerId, followedId });

    res.status(201).json({ message: 'Successfully followed user.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /users/:id/follow
export const unfollowUser = async (req, res, next) => {
  try {
    const validation = userIdParamsSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request parameters.',
        details: formatZodIssues(validation.error)
      });
    }

    const followedId = validation.data.id;
    const followerId = req.user.id;

    // Check if relationship exists
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followedId: {
          followerId,
          followedId
        }
      }
    });

    if (!existingFollow) {
      return res.status(404).json({ error: 'You are not following this user.' });
    }

    // Delete follow relationship
    await prisma.follower.delete({
      where: {
        followerId_followedId: {
          followerId,
          followedId
        }
      }
    });

    res.status(200).json({ message: 'Successfully unfollowed user.' });
  } catch (error) {
    next(error);
  }
};

// GET /users/following (requires auth, recruiter can see list of followed students)
export const getFollowing = async (req, res, next) => {
  try {
    const followerId = req.user.id;

    const following = await prisma.follower.findMany({
      where: { followerId },
      include: {
        followed: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            projects: {
              select: {
                id: true,
                title: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const followedUsers = following.map((f) => ({
      id: f.followed.id,
      name: f.followed.name,
      email: f.followed.email,
      avatarUrl: f.followed.avatarUrl,
      projectsCount: f.followed.projects.length,
      recentProjects: f.followed.projects.slice(0, 3),
      followedAt: f.createdAt,
    }));

    res.status(200).json({ following: followedUsers });
  } catch (error) {
    next(error);
  }
};

