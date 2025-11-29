import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

// POST /auth/register
router.post('/register', register);

// POST /auth/login
router.post('/login', login);

// POST /auth/refresh-token
router.post('/refresh-token', refreshToken);

// POST /auth/logout
router.post('/logout', logout);

// POST /auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /auth/reset-password/:token
router.post('/reset-password/:token', resetPassword);

export default router;
