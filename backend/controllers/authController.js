import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  authProvider: user.authProvider,
  createdAt: user.createdAt,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (name.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered. Please sign in instead.' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login or register with Google
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      return res.status(503).json({ message: 'Google login is not configured. Add GOOGLE_CLIENT_ID in backend/.env.' });
    }

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const verifyUrl = new URL('https://oauth2.googleapis.com/tokeninfo');
    verifyUrl.searchParams.set('id_token', credential);

    const response = await fetch(verifyUrl);
    const profile = await response.json().catch(() => ({}));

    if (!response.ok || profile.aud !== googleClientId || profile.email_verified !== 'true') {
      return res.status(401).json({ message: 'Google authentication failed' });
    }

    let user = await User.findOne({ email: profile.email.toLowerCase() });

    if (user) {
      user.googleId = profile.sub;
      user.avatar = profile.picture || user.avatar;
      if (!user.authProvider) user.authProvider = 'google';
      await user.save();
    } else {
      user = await User.create({
        name: profile.name || profile.email.split('@')[0],
        email: profile.email,
        googleId: profile.sub,
        avatar: profile.picture || '',
        authProvider: 'google',
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Google login successful',
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json({
    user: buildUserResponse(req.user),
  });
};
