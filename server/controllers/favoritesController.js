import { Favorite } from '../models/Favorite.js';
import { User } from '../models/User.js';

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

// ==================== PEOPLE FAVORITES ====================

// Add person to favorites
export const addPersonToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, name, profile_path, known_for_department, popularity } = req.body;

    if (!id || !name) {
      return res.status(400).json({ message: 'Person ID and name are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already in favorites
    const alreadyFavorited = user.favorite_people.some(person => person.id === id);
    if (alreadyFavorited) {
      return res.status(400).json({ message: 'Person already in favorites' });
    }

    // Add to favorites
    user.favorite_people.push({
      id,
      name,
      profile_path,
      known_for_department,
      popularity
    });

    await user.save();

    res.status(201).json({
      message: 'Person added to favorites',
      person: { id, name, profile_path, known_for_department, popularity }
    });
  } catch (err) {
    console.error('Add person to favorites error:', err);
    res.status(500).json({ message: 'Server error while adding person to favorites' });
  }
};

// Remove person from favorites
export const removePersonFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { personId } = req.params;

    if (!personId) {
      return res.status(400).json({ message: 'Person ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from favorites
    user.favorite_people = user.favorite_people.filter(person => person.id !== personId);
    await user.save();

    res.json({
      message: 'Person removed from favorites',
      personId
    });
  } catch (err) {
    console.error('Remove person from favorites error:', err);
    res.status(500).json({ message: 'Server error while removing person from favorites' });
  }
};

// Check if person is in favorites
export const checkPersonFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { personId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFavorite = user.favorite_people.some(person => person.id === personId);

    res.json({ isFavorite });
  } catch (err) {
    console.error('Check person favorite error:', err);
    res.status(500).json({ message: 'Server error while checking person favorite' });
  }
};

// Get all favorite people
export const getFavoritePeople = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      count: user.favorite_people.length,
      people: user.favorite_people
    });
  } catch (err) {
    console.error('Get favorite people error:', err);
    res.status(500).json({ message: 'Server error while fetching favorite people' });
  }
};
