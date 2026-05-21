import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const isPlaceholderKey = !apiKey || apiKey === 'GEMINI_API_KEY';

const genAI = isPlaceholderKey ? null : new GoogleGenerativeAI(apiKey);

const getModel = () => {
  if (!genAI) {
    const error = new Error('Gemini API key is missing or still set to the placeholder value. Add a valid GEMINI_API_KEY in backend/.env.');
    error.statusCode = 503;
    throw error;
  }

  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

const ALEX_SYSTEM_PROMPT = `You are Alex, a strict and highly experienced Senior Software Engineer at a FAANG company conducting a technical interview. Your role is to rigorously evaluate candidates.

PERSONALITY:
- Direct, analytical, and professional — no small talk
- You challenge weak or vague answers with follow-up questions
- You appreciate structured thinking (STAR method, Big O analysis, trade-offs)
- You give concise but precise feedback after each answer
- You never give away answers, but you guide candidates to think deeper

BEHAVIOR RULES:
1. Ask one focused question at a time
2. After each candidate response, give brief feedback (1-2 sentences) then ask the next question or a follow-up
3. If an answer is strong, acknowledge it briefly and move on
4. If an answer is weak, say so directly and ask a follow-up to probe understanding
5. Keep responses under 200 words unless explaining a technical concept
6. Use technical terminology appropriately
7. For DSA questions: focus on time/space complexity, edge cases, optimal solutions
8. For system design: focus on scalability, trade-offs, bottlenecks
9. For behavioral: use STAR method evaluation
10. Always maintain a professional, slightly intimidating interviewer persona

RESPONSE FORMAT:
- Start with brief feedback on the previous answer (if applicable)
- Then ask the next question clearly
- Format code blocks with proper markdown
- Be direct — no filler phrases like "Great question!" or "Absolutely!"

EVALUATION CRITERIA (track internally):
- Technical accuracy (0-10)
- Communication clarity (0-10)
- Problem-solving approach (0-10)
- Confidence and depth (0-10)`;

const CATEGORY_PROMPTS = {
  dsa: `Focus on Data Structures & Algorithms. Start with a medium-difficulty problem. Topics: arrays, strings, linked lists, trees, graphs, dynamic programming, sorting, searching. Always ask about time/space complexity.`,
  'system-design': `Focus on System Design. Start with a scalable system design problem (e.g., URL shortener, chat system, rate limiter). Topics: scalability, databases, caching, load balancing, microservices, CAP theorem.`,
  behavioral: `Focus on Behavioral questions. Use STAR method (Situation, Task, Action, Result). Topics: leadership, conflict resolution, failure handling, teamwork, technical decisions, career growth.`,
  mixed: `Mix of DSA, System Design, and Behavioral questions. Start with a warm-up behavioral question, then move to technical topics.`,
};

export const startInterviewSession = async (category, userName) => {
  const model = getModel();

  const categoryContext = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.mixed;

  const prompt = `${ALEX_SYSTEM_PROMPT}

INTERVIEW TYPE: ${categoryContext}

The candidate's name is ${userName}. Begin the interview now. Introduce yourself briefly as Alex (1-2 sentences max), then immediately ask your first interview question. No pleasantries beyond the brief intro.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

export const continueInterviewSession = async (messages, category, userMessage) => {
  const model = getModel();

  const categoryContext = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.mixed;

  // Build conversation history for context
  const conversationHistory = messages
    .map((m) => `${m.role === 'user' ? 'CANDIDATE' : 'ALEX'}: ${m.content}`)
    .join('\n\n');

  const prompt = `${ALEX_SYSTEM_PROMPT}

INTERVIEW TYPE: ${categoryContext}

CONVERSATION SO FAR:
${conversationHistory}

CANDIDATE: ${userMessage}

Respond as Alex. Give brief feedback on their answer, then continue the interview with the next question or follow-up. If this appears to be the 6th+ exchange, consider wrapping up and telling the candidate you'll provide a final evaluation.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

export const generateFinalEvaluation = async (messages, category) => {
  const model = getModel();

  const conversationHistory = messages
    .map((m) => `${m.role === 'user' ? 'CANDIDATE' : 'ALEX'}: ${m.content}`)
    .join('\n\n');

  const prompt = `You are Alex, a senior FAANG engineer. Based on this interview transcript, provide a structured final evaluation.

INTERVIEW TYPE: ${category}

FULL TRANSCRIPT:
${conversationHistory}

Respond ONLY with a valid JSON object (no markdown, no explanation) in this exact format:
{
  "scores": {
    "communication": <0-10>,
    "technicalAccuracy": <0-10>,
    "problemSolving": <0-10>,
    "confidence": <0-10>,
    "overall": <0-10>
  },
  "finalVerdict": "<hire|weak-hire|no-hire>",
  "feedback": "<2-3 sentences overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"]
}

Base the verdict on: hire (8+/10 overall), weak-hire (6-7.9), no-hire (<6).`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text().trim();

  // Clean up response - remove markdown code blocks if present
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Return default if parsing fails
    return {
      scores: {
        communication: 5,
        technicalAccuracy: 5,
        problemSolving: 5,
        confidence: 5,
        overall: 5,
      },
      finalVerdict: 'weak-hire',
      feedback: 'The interview session has been completed. Evaluation data could not be fully processed.',
      strengths: ['Participated in the interview', 'Engaged with questions'],
      improvements: ['Continue practicing', 'Work on technical depth'],
    };
  }
};
