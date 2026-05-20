import prisma from '../config/prisma.js';
import { CustomError } from '../middleware/errorHandler.js';

export const createTask = async (req, res, next) => {
  const { title, description, status, priority, dueDate } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  const { status, priority, search, all, sortBy } = req.query;

  try {
    const where = {};

    // RBAC: Standard user can ONLY fetch their own tasks.
    // Admin can toggle `all=true` to fetch all tasks across the system.
    if (req.user.role === 'ADMIN' && all === 'true') {
      // Fetch all tasks, maybe filter by a specific user if provided
    } else {
      where.userId = req.user.id;
    }

    // Filter by status
    if (status) {
      where.status = status.toUpperCase();
    }

    // Filter by priority
    if (priority) {
      where.priority = priority.toUpperCase();
    }

    // Search query (case-insensitive in SQLite/Prisma)
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Parse sorting query (e.g. sortBy=createdAt:desc or sortBy=dueDate:asc)
    let orderBy = { createdAt: 'desc' }; // default sorting
    if (sortBy) {
      const [field, order] = sortBy.split(':');
      if (['createdAt', 'dueDate', 'title', 'priority'].includes(field)) {
        orderBy = { [field]: order === 'asc' ? 'asc' : 'desc' };
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      return next(new CustomError('Task not found.', 404));
    }

    // Enforce ownership: Non-admins can only see their own tasks
    if (req.user.role !== 'ADMIN' && task.userId !== req.user.id) {
      return next(new CustomError('Access denied. You do not own this task.', 403));
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, status, priority, dueDate } = req.body;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return next(new CustomError('Task not found.', 404));
    }

    // Enforce ownership: Non-admins can only edit their own tasks
    if (req.user.role !== 'ADMIN' && task.userId !== req.user.id) {
      return next(new CustomError('Access denied. You do not own this task.', 403));
    }

    const updatedData = {};
    if (title !== undefined) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    if (status !== undefined) updatedData.status = status.toUpperCase();
    if (priority !== undefined) updatedData.priority = priority.toUpperCase();
    if (dueDate !== undefined) updatedData.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updatedData,
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return next(new CustomError('Task not found.', 404));
    }

    // Enforce ownership: Non-admins can only delete their own tasks
    if (req.user.role !== 'ADMIN' && task.userId !== req.user.id) {
      return next(new CustomError('Access denied. You do not own this task.', 403));
    }

    await prisma.task.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
