export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message;

  if (message.includes('API key not valid')) {
    statusCode = 503;
    message = 'Groq API key is invalid. Update GROQ_API_KEY in backend/.env with a valid Groq API key.';
  }

  if (message.includes('Too Many Requests') || message.includes('quota')) {
    statusCode = 429;
    message = 'Groq API rate limit or quota is exhausted for this key/project. Check GroqCloud limits, billing, or try again after the retry window.';
  }

  if (message.includes('model') && (message.includes('not found') || message.includes('does not exist') || message.includes('decommissioned'))) {
    statusCode = 503;
    message = 'Configured Groq model is not available. Set GROQ_MODEL in backend/.env to a supported model such as llama-3.1-8b-instant.';
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
