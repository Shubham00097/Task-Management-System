import jwt from 'jsonwebtoken';
import { CustomError } from './errorHandler.js';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new CustomError('Access denied. No token provided.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new CustomError('Token has expired. Please log in again.', 401));
    }
    return next(new CustomError('Invalid token. Authorization failed.', 401));
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new CustomError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new CustomError(`Forbidden. Access requires one of the following roles: ${allowedRoles.join(', ')}`, 403));
    }

    next();
  };
};
