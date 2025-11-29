import mongoose from 'mongoose';

const watchLaterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    itemId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    poster: {
      type: String
    },
    mediaType: {
      type: String,
      enum: ['tv', 'movie'],
      required: true
    },
    overview: {
      type: String
    },
    rating: {
      type: Number
    },
    releaseDate: {
      type: String
    }
  },
  { timestamps: true }
);

// Compound index to ensure a user can't add the same item twice
watchLaterSchema.index({ user: 1, itemId: 1 }, { unique: true });

export const WatchLater = mongoose.model('WatchLater', watchLaterSchema);
