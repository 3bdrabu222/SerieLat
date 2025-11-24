import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      trim: true
    },
    password: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user' 
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationCode: {
      type: String,
      select: false // Don't return this field by default
    },
    verificationCodeExpires: {
      type: Date,
      select: false
    }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
