import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { changePassword, getUserProfile } from '../controllers/userController';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// @desc    Change user password
// @route   PUT /api/users/change-password
router.put('/change-password', changePassword);

// @desc    Get user profile
// @route   GET /api/users/profile
router.get('/profile', getUserProfile);

export default router;
