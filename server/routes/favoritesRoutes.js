import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkFavorite
} from '../controllers/favoritesController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /favorites/add - Add movie to favorites
router.post('/add', addToFavorites);

// DELETE /favorites/remove/:movieId - Remove movie from favorites
router.delete('/remove/:movieId', removeFromFavorites);

// GET /favorites - Get all user favorites
router.get('/', getUserFavorites);

// GET /favorites/check/:movieId - Check if movie is in favorites
router.get('/check/:movieId', checkFavorite);

export default router;
