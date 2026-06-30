import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/db.js';
import { appEvents } from '../events/eventEmitter.js';
import { UPLOAD_DIR } from '../middlewares/uploadMiddleware.js';
import { formatZodIssues, paginationSchema, uuidSchema } from '../utils/validation.js';

const projectIdParamsSchema = z.object({
  id: uuidSchema,
});

const projectListQuerySchema = paginationSchema.extend({
  studentId: uuidSchema.optional(),
});

const httpUrlSchema = z.string()
  .trim()
  .url('Invalid URL format')
  .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), 'URL must use HTTP or HTTPS');

// Zod schemas for validation
const createProjectSchema = z.object({
  title: z.string()
    .trim()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string()
    .trim()
    .min(10, 'Description must be at least 10 characters long')
    .max(2000, 'Description cannot exceed 2000 characters'),
  repositoryUrl: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    httpUrlSchema.optional()
  )
});

const updateProjectSchema = z.object({
  title: z.string()
    .trim()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters')
    .optional(),
  description: z.string()
    .trim()
    .min(10, 'Description must be at least 10 characters long')
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  repositoryUrl: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    httpUrlSchema.nullable().optional()
  ),
  isArchived: z.boolean().optional()
});

// Helper to delete uploaded files from local disk
const deleteFile = (fileUrl) => {
  if (fileUrl && fileUrl.startsWith('/uploads/')) {
    const filename = path.basename(fileUrl);
    const filePath = path.resolve(UPLOAD_DIR, filename);
    if (!filePath.startsWith(`${UPLOAD_DIR}${path.sep}`)) {
      return;
    }
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete old file: ${filePath}`, err);
      }
    }
  }
};

// POST /projects (create — student only, requires auth)
export const createProject = async (req, res, next) => {
  try {
    const validation = createProjectSchema.safeParse(req.body);
    if (!validation.success) {
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(400).json({
        error: 'Validation failed',
        details: formatZodIssues(validation.error)
      });
    }

    const { title, description, repositoryUrl } = validation.data;
    const thumbnailUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        repositoryUrl: repositoryUrl || null,
        thumbnailUrl,
        studentId: req.user.id
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    // Emit event
    appEvents.emit('ProjectCreated', { studentId: req.user.id, projectId: project.id });

    res.status(201).json(project);
  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(error);
  }
};

// GET /projects (list all — public, support pagination + filter by student)
export const listProjects = async (req, res, next) => {
  try {
    const validation = projectListQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid query parameters.',
        details: formatZodIssues(validation.error)
      });
    }

    const { page, limit, studentId } = validation.data;
    const skip = (page - 1) * limit;

    const where = { isArchived: false }; // Hide archived projects by default
    if (req.user && req.user.role === 'ADMIN') {
      delete where.isArchived; // Admin sees everything
    }
    if (studentId) {
      where.studentId = studentId;
      // If the owner themselves is requesting their list, show archived projects too
      if (req.user && req.user.id === studentId) {
        delete where.isArchived;
      }
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          },
          _count: {
            select: { likes: true }
          }
        }
      }),
      prisma.project.count({ where })
    ]);

    let finalProjects = projects;
    if (req.user) {
      const projectIds = projects.map((p) => p.id);
      const userLikes = await prisma.like.findMany({
        where: {
          userId: req.user.id,
          projectId: { in: projectIds }
        },
        select: { projectId: true }
      });
      const likedProjectIds = new Set(userLikes.map((l) => l.projectId));
      finalProjects = projects.map((p) => ({
        ...p,
        hasLiked: likedProjectIds.has(p.id)
      }));
    }

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      projects: finalProjects,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /projects/:id (single project detail — public)
export const getProjectDetail = async (req, res, next) => {
  try {
    const validation = projectIdParamsSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request parameters.',
        details: formatZodIssues(validation.error)
      });
    }

    const { id } = validation.data;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        _count: {
          select: { likes: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    let hasLiked = false;
    let isFollowing = false;

    if (req.user) {
      const [likeRecord, followRecord] = await Promise.all([
        prisma.like.findUnique({
          where: {
            userId_projectId: {
              userId: req.user.id,
              projectId: id
            }
          }
        }),
        prisma.follower.findUnique({
          where: {
            followerId_followedId: {
              followerId: req.user.id,
              followedId: project.studentId
            }
          }
        })
      ]);
      hasLiked = !!likeRecord;
      isFollowing = !!followRecord;
    }

    res.status(200).json({
      ...project,
      hasLiked,
      isFollowing
    });
  } catch (error) {
    next(error);
  }
};

// PUT /projects/:id (update — only the owning student)
export const updateProject = async (req, res, next) => {
  try {
    const paramValidation = projectIdParamsSchema.safeParse(req.params);
    if (!paramValidation.success) {
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(400).json({
        error: 'Invalid request parameters.',
        details: formatZodIssues(paramValidation.error)
      });
    }

    const { id } = paramValidation.data;

    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Authorization: only the owner student can update
    if (existingProject.studentId !== req.user.id) {
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(403).json({ error: 'Forbidden. You can only update your own projects.' });
    }

    const validation = updateProjectSchema.safeParse(req.body);
    if (!validation.success) {
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(400).json({
        error: 'Validation failed',
        details: formatZodIssues(validation.error)
      });
    }

    const { title, description, repositoryUrl, isArchived } = validation.data;

    let thumbnailUrl = existingProject.thumbnailUrl;
    if (req.file) {
      thumbnailUrl = `/uploads/${req.file.filename}`;
      // Clean up previous image file from local disk
      deleteFile(existingProject.thumbnailUrl);
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingProject.title,
        description: description !== undefined ? description : existingProject.description,
        repositoryUrl: repositoryUrl !== undefined ? repositoryUrl : existingProject.repositoryUrl,
        isArchived: isArchived !== undefined ? isArchived : existingProject.isArchived,
        thumbnailUrl
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(error);
  }
};

// DELETE /projects/:id (delete — only the owning student or admin)
export const deleteProject = async (req, res, next) => {
  try {
    const validation = projectIdParamsSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request parameters.',
        details: formatZodIssues(validation.error)
      });
    }

    const { id } = validation.data;

    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Authorization: owning student or admin can delete
    const isOwner = existingProject.studentId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission to delete this project.' });
    }

    await prisma.project.delete({
      where: { id }
    });

    // Delete image file associated with project from local disk
    deleteFile(existingProject.thumbnailUrl);

    res.status(200).json({ message: 'Project successfully deleted.' });
  } catch (error) {
    next(error);
  }
};

// POST /projects/:id/like
export const likeProject = async (req, res, next) => {
  try {
    const validation = projectIdParamsSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request parameters.',
        details: formatZodIssues(validation.error)
      });
    }

    const projectId = validation.data.id;
    const userId = req.user.id;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    if (existingLike) {
      return res.status(400).json({ error: 'You have already liked this project.' });
    }

    // Create like
    await prisma.like.create({
      data: {
        userId,
        projectId
      }
    });

    // Emit event
    appEvents.emit('ProjectLiked', { userId, projectId });

    res.status(201).json({ message: 'Project liked successfully.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /projects/:id/like
export const unlikeProject = async (req, res, next) => {
  try {
    const validation = projectIdParamsSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request parameters.',
        details: formatZodIssues(validation.error)
      });
    }

    const projectId = validation.data.id;
    const userId = req.user.id;

    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    if (!existingLike) {
      return res.status(404).json({ error: 'You have not liked this project.' });
    }

    // Delete like
    await prisma.like.delete({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    res.status(200).json({ message: 'Project unliked successfully.' });
  } catch (error) {
    next(error);
  }
};
