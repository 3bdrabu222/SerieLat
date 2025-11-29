import express from 'express';
import {
  addToWatchLater,
  removeFromWatchLater,
  getWatchLater,
  checkWatchLater
} from '../controllers/watchLaterController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected with authentication
router.use(authMiddleware);

// POST /api/watchlater/add - Add item to watch later
router.post('/add', addToWatchLater);

// DELETE /api/watchlater/remove/:itemId - Remove item from watch later
router.delete('/remove/:itemId', removeFromWatchLater);

// GET /api/watchlater - Get all watch later items
router.get('/', getWatchLater);

// GET /api/watchlater/check/:itemId - Check if item is in watch later
router.get('/check/:itemId', checkWatchLater);

export default router;
