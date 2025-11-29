import { WatchLater } from '../models/WatchLater.js';

// Add item to watch later
export const addToWatchLater = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, title, poster, mediaType, overview, rating, releaseDate } = req.body;

    // Validate required fields
    if (!itemId || !title || !mediaType) {
      return res.status(400).json({ 
        message: 'Item ID, title, and media type are required' 
      });
    }

    // Validate mediaType
    if (!['tv', 'movie'].includes(mediaType)) {
      return res.status(400).json({ 
        message: 'Media type must be either "tv" or "movie"' 
      });
    }

    // Check if already in watch later
    const existingItem = await WatchLater.findOne({ user: userId, itemId });
    if (existingItem) {
      return res.status(400).json({ message: 'Already added to Watch Later' });
    }

    // Create new watch later item
    const watchLaterItem = await WatchLater.create({
      user: userId,
      itemId,
      title,
      poster,
      mediaType,
      overview,
      rating,
      releaseDate
    });

    res.status(201).json({
      message: 'Added to Watch Later',
      item: {
        id: watchLaterItem._id,
        itemId: watchLaterItem.itemId,
        title: watchLaterItem.title,
        poster: watchLaterItem.poster,
        mediaType: watchLaterItem.mediaType,
        overview: watchLaterItem.overview,
        rating: watchLaterItem.rating,
        releaseDate: watchLaterItem.releaseDate,
        createdAt: watchLaterItem.createdAt
      }
    });
  } catch (err) {
    console.error('Add to watch later error:', err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Already added to Watch Later' });
    }
    
    res.status(500).json({ message: 'Server error while adding to watch later' });
  }
};

// Remove item from watch later
export const removeFromWatchLater = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    const item = await WatchLater.findOneAndDelete({
      user: userId,
      itemId
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found in Watch Later' });
    }

    res.json({
      message: 'Removed from Watch Later',
      itemId
    });
  } catch (err) {
    console.error('Remove from watch later error:', err);
    res.status(500).json({ message: 'Server error while removing from watch later' });
  }
};

// Get all user watch later items
export const getWatchLater = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await WatchLater.find({ user: userId })
      .sort({ createdAt: -1 }); // Most recent first

    res.json({
      count: items.length,
      items: items.map(item => ({
        id: item._id,
        itemId: item.itemId,
        title: item.title,
        poster: item.poster,
        mediaType: item.mediaType,
        overview: item.overview,
        rating: item.rating,
        releaseDate: item.releaseDate,
        createdAt: item.createdAt
      }))
    });
  } catch (err) {
    console.error('Get watch later error:', err);
    res.status(500).json({ message: 'Server error while fetching watch later items' });
  }
};

// Check if item is in watch later
export const checkWatchLater = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const item = await WatchLater.findOne({ user: userId, itemId });

    res.json({
      isInWatchLater: !!item,
      itemId: item?._id
    });
  } catch (err) {
    console.error('Check watch later error:', err);
    res.status(500).json({ message: 'Server error while checking watch later' });
  }
};
