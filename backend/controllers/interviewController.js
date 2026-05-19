import Interview from '../models/Interview.js';
import {
  startInterviewSession,
  continueInterviewSession,
  generateFinalEvaluation,
} from '../services/groqService.js';

const CATEGORY_TITLES = {
  dsa: 'DSA & Algorithms',
  'system-design': 'System Design',
  oops: 'OOP Concepts',
  'computer-network': 'Computer Networks',
  dbms: 'DBMS',
  'operating-system': 'Operating Systems',
  behavioral: 'Behavioral',
  mixed: 'Mixed Interview',
};

const VALID_CATEGORIES = Object.keys(CATEGORY_TITLES);

// @desc    Start a new interview
// @route   POST /api/interview/start
// @access  Private
export const startInterview = async (req, res, next) => {
  try {
    const { category } = req.body;

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid interview category' });
    }

    // Get AI opening message
    const aiMessage = await startInterviewSession(category, req.user.name);

    const interview = await Interview.create({
      userId: req.user._id,
      category,
      title: CATEGORY_TITLES[category],
      messages: [
        {
          role: 'assistant',
          content: aiMessage,
        },
      ],
      questionCount: 1,
    });

    res.status(201).json({
      interview: {
        _id: interview._id,
        category: interview.category,
        title: interview.title,
        messages: interview.messages,
        status: interview.status,
        createdAt: interview.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message in an interview
// @route   POST /api/interview/message
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { interviewId, message, endInterview } = req.body;

    if (!interviewId || !message) {
      return res.status(400).json({ message: 'Interview ID and message are required' });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.status !== 'active') {
      return res.status(400).json({ message: 'This interview has already ended' });
    }

    // Add user message
    interview.messages.push({ role: 'user', content: message });

    let aiResponse;
    let evaluation = null;

    // Check if we should end the interview (after enough exchanges or user requested)
    const userMessageCount = interview.messages.filter((m) => m.role === 'user').length;
    const shouldEnd = endInterview || userMessageCount >= 7;

    if (shouldEnd) {
      // Generate final evaluation
      evaluation = await generateFinalEvaluation(interview.messages, interview.category);

      // Create wrap-up message
      const verdictMessages = {
        hire: "That concludes our interview. I have all the information I need. You've demonstrated strong technical abilities and communication. I'll be recommending you move forward.",
        'weak-hire': "That concludes our interview. You showed some solid fundamentals but there were gaps in depth on a few areas. I'll submit a weak hire recommendation — worth investing in.",
        'no-hire': "That concludes our interview. Unfortunately, the responses didn't meet the bar we need at this level. I'd encourage you to study more and apply again in 6 months.",
      };

      aiResponse = verdictMessages[evaluation.finalVerdict] ||
        "That concludes our interview. I have enough information to make my assessment. Thank you for your time.";

      // Update interview with final data
      interview.messages.push({ role: 'assistant', content: aiResponse });
      interview.scores = evaluation.scores;
      interview.finalVerdict = evaluation.finalVerdict;
      interview.feedback = evaluation.feedback;
      interview.strengths = evaluation.strengths;
      interview.improvements = evaluation.improvements;
      interview.status = 'completed';
    } else {
      // Continue interview
      aiResponse = await continueInterviewSession(
        interview.messages.slice(-10), // Last 10 messages for context
        interview.category,
        message
      );
      interview.messages.push({ role: 'assistant', content: aiResponse });
      interview.questionCount = Math.floor(interview.messages.length / 2);
    }

    await interview.save();

    res.json({
      message: aiResponse,
      interviewId: interview._id,
      isCompleted: shouldEnd,
      evaluation: shouldEnd ? evaluation : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interview history for user
// @route   GET /api/interview/history
// @access  Private
export const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-messages')
      .lean();

    const total = await Interview.countDocuments({ userId: req.user._id });

    // Stats
    const completed = interviews.filter((i) => i.status === 'completed');
    const avgScore =
      completed.length > 0
        ? completed.reduce((acc, i) => acc + (i.scores?.overall || 0), 0) / completed.length
        : 0;

    const categoryBreakdown = interviews.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      interviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        total,
        completed: completed.length,
        avgScore: Math.round(avgScore * 10) / 10,
        categoryBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interview by ID
// @route   GET /api/interview/:id
// @access  Private
export const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ interview });
  } catch (error) {
    next(error);
  }
};

// @desc    Abandon an interview
// @route   PUT /api/interview/:id/abandon
// @access  Private
export const abandonInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, status: 'active' },
      { status: 'abandoned' },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found or already ended' });
    }

    res.json({ message: 'Interview abandoned', interview });
  } catch (error) {
    next(error);
  }
};
