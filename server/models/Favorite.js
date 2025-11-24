import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    movieId: {
      type: String,
      required: true
    },
    movieTitle: {
      type: String,
      required: true
    },
    moviePoster: {
      type: String
    },
    movieOverview: {
      type: String
    },
    movieRating: {
      type: Number
    },
    movieReleaseDate: {
      type: String
    },
    movieType: {
      type: String,
      enum: ['tv', 'movie'],
      default: 'tv'
    }
  },
  { timestamps: true }
);

// Compound index to ensure a user can't add the same movie twice
favoriteSchema.index({ user: 1, movieId: 1 }, { unique: true });

export const Favorite = mongoose.model('Favorite', favoriteSchema);
