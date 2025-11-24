import { Favorite } from '../models/Favorite.js';

// Add movie to favorites
export const addToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      movieId,
      movieTitle,
      moviePoster,
      movieOverview,
      movieRating,
      movieReleaseDate,
      movieType
    } = req.body;

    // Validate required fields
    if (!movieId || !movieTitle) {
      return res.status(400).json({ message: 'Movie ID and title are required' });
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({ user: userId, movieId });
    if (existingFavorite) {
      return res.status(400).json({ message: 'Movie already in favorites' });
    }

    // Create new favorite
    const favorite = await Favorite.create({
      user: userId,
      movieId,
      movieTitle,
      moviePoster,
      movieOverview,
      movieRating,
      movieReleaseDate,
      movieType: movieType || 'tv'
    });

    res.status(201).json({
      message: 'Movie added to favorites',
      favorite: {
        id: favorite._id,
        movieId: favorite.movieId,
        movieTitle: favorite.movieTitle,
        moviePoster: favorite.moviePoster,
        movieOverview: favorite.movieOverview,
        movieRating: favorite.movieRating,
        movieReleaseDate: favorite.movieReleaseDate,
        movieType: favorite.movieType,
        createdAt: favorite.createdAt
      }
    });
  } catch (err) {
    console.error('Add to favorites error:', err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Movie already in favorites' });
    }
    
    res.status(500).json({ message: 'Server error while adding to favorites' });
  }
};

// Remove movie from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({ message: 'Movie ID is required' });
    }

    const favorite = await Favorite.findOneAndDelete({
      user: userId,
      movieId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({
      message: 'Movie removed from favorites',
      movieId
    });
  } catch (err) {
    console.error('Remove from favorites error:', err);
    res.status(500).json({ message: 'Server error while removing from favorites' });
  }
};

// Get all user favorites
export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({ user: userId })
      .sort({ createdAt: -1 }); // Most recent first

    res.json({
      count: favorites.length,
      favorites: favorites.map(fav => ({
        id: fav._id,
        movieId: fav.movieId,
        movieTitle: fav.movieTitle,
        moviePoster: fav.moviePoster,
        movieOverview: fav.movieOverview,
        movieRating: fav.movieRating,
        movieReleaseDate: fav.movieReleaseDate,
        movieType: fav.movieType,
        createdAt: fav.createdAt
      }))
    });
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ message: 'Server error while fetching favorites' });
  }
};

// Check if movie is in favorites
export const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    const favorite = await Favorite.findOne({ user: userId, movieId });

    res.json({
      isFavorite: !!favorite,
      favoriteId: favorite?._id
    });
  } catch (err) {
    console.error('Check favorite error:', err);
    res.status(500).json({ message: 'Server error while checking favorite' });
  }
};
