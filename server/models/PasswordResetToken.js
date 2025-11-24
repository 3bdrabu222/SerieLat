import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    token: { 
      type: String, 
      required: true,
      unique: true
    },
    expiresAt: { 
      type: Date, 
      required: true 
    },
    used: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

// Auto-delete expired tokens after 1 hour
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export const PasswordResetToken = mongoose.model(
  'PasswordResetToken',
  passwordResetTokenSchema
);
