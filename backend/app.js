import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

// Allow local development, the configured production frontend, and all Vercel preview URLs.
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

// CORS must return the exact requesting origin when credentials are enabled.
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log requests in development so API failures are easier to debug locally.
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Simple Render/local health check endpoint.
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI-Interview API is running', timestamp: new Date().toISOString() });
});

// Feature routes.
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);

// 404 and centralized error handling stay last.
app.use(notFound);
app.use(errorHandler);

export default app;
