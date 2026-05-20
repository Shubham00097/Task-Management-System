import { Router } from 'express';
import { body, query, param } from 'express-validator';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validator.js';

const router = Router();

// Secure all task routes
router.use(authenticateJWT);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Complete internship assignment
 *               description:
 *                 type: string
 *                 example: Implement JWT auth and Swagger documentation
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED]
 *                 default: PENDING
 *                 example: IN_PROGRESS
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *                 default: MEDIUM
 *                 example: HIGH
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-24T18:00:00.000Z
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Task title is required')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters')
      .escape(),
    body('description').optional().trim().escape(),
    body('status')
      .optional()
      .trim()
      .toUpperCase()
      .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
      .withMessage('Status must be PENDING, IN_PROGRESS, or COMPLETED'),
    body('priority')
      .optional()
      .trim()
      .toUpperCase()
      .isIn(['LOW', 'MEDIUM', 'HIGH'])
      .withMessage('Priority must be LOW, MEDIUM, or HIGH'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid ISO8601 date string'),
  ],
  validateRequest,
  createTask
);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Retrieve tasks
 *     description: Standard users retrieve their own tasks. Admins can fetch all tasks with ?all=true
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter tasks by status (PENDING, IN_PROGRESS, COMPLETED)
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter tasks by priority (LOW, MEDIUM, HIGH)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *         description: Admin toggle to view all tasks from all users (e.g. true)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort field and direction (e.g., createdAt:desc, dueDate:asc)
 *     responses:
 *       200:
 *         description: Returns list of tasks
 */
router.get(
  '/',
  [
    query('status')
      .optional()
      .trim()
      .toUpperCase()
      .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
      .withMessage('Status must be PENDING, IN_PROGRESS, or COMPLETED'),
    query('priority')
      .optional()
      .trim()
      .toUpperCase()
      .isIn(['LOW', 'MEDIUM', 'HIGH'])
      .withMessage('Priority must be LOW, MEDIUM, or HIGH'),
    query('search').optional().trim(),
    query('all').optional().isBoolean().withMessage('All must be a boolean value'),
    query('sortBy').optional().trim(),
  ],
  validateRequest,
  getTasks
);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Retrieve a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task UUID
 *     responses:
 *       200:
 *         description: Returns task details
 *       403:
 *         description: Forbidden (not the task owner)
 *       404:
 *         description: Task not found
 */
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid task ID format')],
  validateRequest,
  getTaskById
);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update an existing task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Task Title
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       403:
 *         description: Forbidden
 *       444:
 *         description: Task not found
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid task ID format'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty if provided')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters')
      .escape(),
    body('description').optional().trim().escape(),
    body('status')
      .optional()
      .trim()
      .toUpperCase()
      .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
      .withMessage('Status must be PENDING, IN_PROGRESS, or COMPLETED'),
    body('priority')
      .optional()
      .trim()
      .toUpperCase()
      .isIn(['LOW', 'MEDIUM', 'HIGH'])
      .withMessage('Priority must be LOW, MEDIUM, or HIGH'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid ISO8601 date string'),
  ],
  validateRequest,
  updateTask
);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task UUID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid task ID format')],
  validateRequest,
  deleteTask
);

export default router;
