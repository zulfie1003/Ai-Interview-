import dotenv from 'dotenv';
dotenv.config({ override: true });

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;
const groqKey = process.env.GROQ_API_KEY || '';

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 AI-Interview server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 Groq configured: ${groqKey.startsWith('gsk_') ? 'yes' : 'no'} (${process.env.GROQ_MODEL || 'llama-3.1-8b-instant'})`);
  });
});
