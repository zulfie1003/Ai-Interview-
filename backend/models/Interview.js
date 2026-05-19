import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const scoresSchema = new mongoose.Schema({
  communication: { type: Number, min: 0, max: 10, default: 0 },
  technicalAccuracy: { type: Number, min: 0, max: 10, default: 0 },
  problemSolving: { type: Number, min: 0, max: 10, default: 0 },
  confidence: { type: Number, min: 0, max: 10, default: 0 },
  overall: { type: Number, min: 0, max: 10, default: 0 },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['dsa', 'system-design', 'oops', 'computer-network', 'dbms', 'operating-system', 'behavioral', 'mixed'],
      required: true,
    },
    title: {
      type: String,
      default: 'Technical Interview',
    },
    messages: [messageSchema],
    scores: {
      type: scoresSchema,
      default: () => ({}),
    },
    finalVerdict: {
      type: String,
      enum: ['hire', 'weak-hire', 'no-hire', 'pending'],
      default: 'pending',
    },
    feedback: {
      type: String,
      default: '',
    },
    strengths: [String],
    improvements: [String],
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
    questionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
interviewSchema.index({ userId: 1, createdAt: -1 });

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
