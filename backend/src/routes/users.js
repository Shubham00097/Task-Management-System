import { Router } from 'express';
import { param, body } from 'express-validator';
import { getUsers, updateUserRole } from '../controllers/userController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validator.js';

const router = Router();

// Secure all user management routes to only be accessible by ADMIN
router.use(authenticateJWT);
router.use(requireRole(['ADMIN']));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve list of all registered users (Admin Only)
 *     tags: [Users Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users in the system
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not an Admin)
 */
router.get('/', getUsers);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Update a user's role on-the-fly (Admin Only)
 *     tags: [Users Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role or Security block (self-demotion)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/role',
  [
    param('id').isUUID().withMessage('Invalid user ID format'),
    body('role')
      .trim()
      .notEmpty()
      .withMessage('Role is required')
      .toUpperCase()
      .isIn(['USER', 'ADMIN'])
      .withMessage('Role must be USER or ADMIN'),
  ],
  validateRequest,
  updateUserRole
);

export default router;
