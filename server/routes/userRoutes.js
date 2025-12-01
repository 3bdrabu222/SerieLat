import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
  changePassword,
  deleteAccount
} from '../controllers/userController.js';

const router = express.Router();

// Protected routes (authenticated users only)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);
router.delete('/delete-account', authMiddleware, deleteAccount);

// Admin only routes
router.get('/admin/users', authMiddleware, roleMiddleware('admin'), getAllUsers);
router.delete('/admin/users/:id', authMiddleware, roleMiddleware('admin'), deleteUser);

export default router;
