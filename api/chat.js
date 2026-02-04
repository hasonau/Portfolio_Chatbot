/**
 * Vercel serverless function: POST /api/chat
 * Same behavior as src/server.js but for Vercel. Set OPENAI_API_KEY in Vercel env.
 */

const OpenAI = require('openai');
const { CHATBOT_SYSTEM_PROMPT } = require('../src/context.js');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ success: false, error: 'OPENAI_API_KEY not configured' });
  }

  try {
    const { message, history = [] } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please send a "message" (string) in the request body.',
      });
    }

    const messages = [
      { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
      ...history.slice(-20).map((h) => ({
        role: (h.role === 'user' || h.role === 'assistant') ? h.role : 'user',
        content: String(h.content || ''),
      })),
      { role: 'user', content: message.trim() },
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      max_tokens: 1024,
      temperature: 0.5,
    });

    const reply = completion.choices[0]?.message?.content ?? 'No response generated.';

    res.status(200).json({
      success: true,
      reply,
      usage: completion.usage ? {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens,
      } : undefined,
    });
  } catch (err) {
    console.error('Chat error:', err.message);
    const status = err.status === 401 ? 401 : err.status === 429 ? 429 : 500;
    res.status(status).json({
      success: false,
      error: err.message || 'Something went wrong while generating a reply.',
    });
  }
};
