import prisma from '../config/prisma.js';
import { CustomError } from '../middleware/errorHandler.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        taskCount: user._count.tasks,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    if (!role || !['USER', 'ADMIN'].includes(role.toUpperCase())) {
      return next(new CustomError('Invalid role. Role must be USER or ADMIN.', 400));
    }

    const targetRole = role.toUpperCase();

    // Prevent admins from demoting themselves
    if (id === req.user.id && targetRole !== 'ADMIN') {
      return next(new CustomError('Security block: You cannot demote yourself. Another Admin must perform this action.', 400));
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return next(new CustomError('User not found.', 404));
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: targetRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `User role updated to ${targetRole} successfully.`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
