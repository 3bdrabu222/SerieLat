import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkFavorite,
  addPersonToFavorites,
  removePersonFromFavorites,
  checkPersonFavorite,
  getFavoritePeople
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

// ==================== PEOPLE FAVORITES ====================
// POST /favorites/people/add - Add person to favorites
router.post('/people/add', addPersonToFavorites);

// DELETE /favorites/people/remove/:personId - Remove person from favorites
router.delete('/people/remove/:personId', removePersonFromFavorites);

// GET /favorites/people/check/:personId - Check if person is in favorites
router.get('/people/check/:personId', checkPersonFavorite);

// GET /favorites/people - Get all favorite people
router.get('/people', getFavoritePeople);

export default router;
