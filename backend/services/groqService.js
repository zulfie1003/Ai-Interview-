import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';

const getApiKey = () => (process.env.GROQ_API_KEY || '').trim();
const getModelName = () => (process.env.GROQ_MODEL || 'llama-3.1-8b-instant').trim();

// Protects the app from calling Groq with an empty or example API key.
const isPlaceholderKey = (apiKey) =>
  !apiKey ||
  apiKey === 'your_groq_api_key_here' ||
  apiKey === 'your_real_groq_api_key' ||
  apiKey.includes('your_');

// Creates errors with HTTP status codes so the global error handler can respond correctly.
const createProviderError = (message, statusCode = 503) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Shared Groq chat-completions helper used by all interview AI features.
const generateText = async (messages, options = {}) => {
  const apiKey = getApiKey();

  if (isPlaceholderKey(apiKey)) {
    throw createProviderError('Groq API key is missing or still set to the placeholder value. Add a valid GROQ_API_KEY in backend/.env.');
  }

  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModelName(),
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 700,
      response_format: options.responseFormat,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error?.message || data.message || response.statusText || 'Groq request failed.';
    throw createProviderError(`Groq API error: ${message}`, response.status);
  }

  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw createProviderError('Groq returned an empty response.');
  }

  return text;
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
  oops: `Focus on Object-Oriented Programming concepts. Start with fundamentals, then move into interview-style scenario questions. Topics: class vs object, encapsulation, abstraction, inheritance, polymorphism, method overloading vs overriding, constructors, interfaces, abstract classes, composition vs inheritance, SOLID principles, coupling, cohesion, and real design examples.`,
  'computer-network': `Focus on Computer Networks. Ask conceptual and scenario-based questions. Topics: OSI and TCP/IP models, TCP vs UDP, HTTP/HTTPS, DNS, IP addressing, subnetting basics, routing, congestion control, handshakes, TLS, sockets, latency, bandwidth, and common network debugging.`,
  dbms: `Focus on Database Management Systems. Ask conceptual and practical database questions. Topics: ER modeling, keys, normalization, SQL joins, indexes, transactions, ACID, concurrency control, locks, isolation levels, deadlocks, query optimization, relational vs NoSQL trade-offs, and schema design.`,
  'operating-system': `Focus on Operating Systems. Ask conceptual and scenario-based questions. Topics: processes vs threads, scheduling, context switching, synchronization, mutexes, semaphores, deadlocks, memory management, paging, virtual memory, file systems, system calls, and I/O.`,
  behavioral: `Focus on Behavioral questions. Use STAR method (Situation, Task, Action, Result). Topics: leadership, conflict resolution, failure handling, teamwork, technical decisions, career growth.`,
  mixed: `Mix of DSA, System Design, OOP, Computer Networks, DBMS, Operating Systems, and Behavioral questions. Start with a warm-up behavioral question, then move to technical and core CS topics.`,
};

// Generates Alex's introduction and first question for a selected interview category.
export const startInterviewSession = async (category, userName) => {
  const categoryContext = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.mixed;

  return generateText([
    { role: 'system', content: ALEX_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `INTERVIEW TYPE: ${categoryContext}

The candidate's name is ${userName}. Begin the interview now. Introduce yourself briefly as Alex (1-2 sentences max), then immediately ask your first interview question. No pleasantries beyond the brief intro.`,
    },
  ]);
};

// Generates Alex's feedback and next question from recent conversation context.
export const continueInterviewSession = async (messages, category, userMessage) => {
  const categoryContext = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.mixed;

  const conversationHistory = messages
    .map((m) => `${m.role === 'user' ? 'CANDIDATE' : 'ALEX'}: ${m.content}`)
    .join('\n\n');

  return generateText([
    { role: 'system', content: ALEX_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `INTERVIEW TYPE: ${categoryContext}

CONVERSATION SO FAR:
${conversationHistory}

CANDIDATE: ${userMessage}

Respond as Alex. Give brief feedback on their answer, then continue the interview with the next question or follow-up. If this appears to be the 6th+ exchange, consider wrapping up and telling the candidate you'll provide a final evaluation.`,
    },
  ]);
};

// Produces the final structured JSON evaluation after the interview ends.
export const generateFinalEvaluation = async (messages, category) => {
  const conversationHistory = messages
    .map((m) => `${m.role === 'user' ? 'CANDIDATE' : 'ALEX'}: ${m.content}`)
    .join('\n\n');

  const text = await generateText(
    [
      {
        role: 'system',
        content: 'You are Alex, a senior FAANG engineer. Return only valid JSON with no markdown.',
      },
      {
        role: 'user',
        content: `Based on this interview transcript, provide a structured final evaluation.

INTERVIEW TYPE: ${category}

FULL TRANSCRIPT:
${conversationHistory}

Respond ONLY with a valid JSON object in this exact format:
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

Base the verdict on: hire (8+/10 overall), weak-hire (6-7.9), no-hire (<6).`,
      },
    ],
    { temperature: 0.2, maxTokens: 900, responseFormat: { type: 'json_object' } }
  );

  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // If the AI returns invalid JSON, keep the app usable with a safe fallback result.
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
