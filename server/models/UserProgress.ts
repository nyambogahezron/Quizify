import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  wordsFound: [{
    word: String,
    foundAt: Date,
  }],
  timeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  stars: {
    type: Number,
    default: 0,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['locked', 'unlocked', 'completed'],
    default: 'locked',
  },
}, {
  timestamps: true,
});

// Create a compound index for efficient querying
userProgressSchema.index({ userId: 1, level: 1 }, { unique: true });

export const UserProgress = mongoose.model('UserProgress', userProgressSchema); 