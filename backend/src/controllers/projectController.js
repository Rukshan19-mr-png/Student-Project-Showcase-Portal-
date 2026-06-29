import { z } from 'zod';
import fs from 'fs';
import { prisma } from '../app.js';
import { appEvents } from '../events/eventEmitter.js';

// Zod schemas for validation
const createProjectSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters long'),
  repositoryUrl: z.string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal(''))
});

const updateProjectSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters')
    .optional(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters long')
    .optional(),
  repositoryUrl: z.string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal(''))
});

// Helper to delete uploaded files from local disk
const deleteFile = (fileUrl) => {
  if (fileUrl && fileUrl.startsWith('/uploads/')) {
    const filePath = fileUrl.substring(1); // remove leading slash
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
        details: validation.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const studentId = req.query.studentId;

    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: 'Page and limit must be positive integers.' });
    }

    const skip = (page - 1) * limit;

    const where = {};
    if (studentId) {
      where.studentId = studentId;
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
          }
        }
      }),
      prisma.project.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      projects,
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
    const { id } = req.params;

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
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// PUT /projects/:id (update — only the owning student)
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

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
        details: validation.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    const { title, description, repositoryUrl } = validation.data;

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
        repositoryUrl: repositoryUrl !== undefined ? (repositoryUrl || null) : existingProject.repositoryUrl,
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
    const { id } = req.params;

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
    const projectId = req.params.id;
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
    const projectId = req.params.id;
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
