require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const { CHATBOT_SYSTEM_PROMPT } = require('./context.js');

const app = express();
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env. Add it to run the chatbot.');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * POST /api/chat
 * Body: { "message": "your question" }
 * Optional: { "message": "...", "history": [{ "role": "user"|"assistant", "content": "..." }] }
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please send a "message" (string) in the request body.',
      });
    }

    const messages = [
      { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
      ...history.slice(-20).map((h) => ({
        role: h.role === 'user' || h.role === 'assistant' ? h.role : 'user',
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

    res.json({
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
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'portfolio-chatbot' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Portfolio chatbot API running at http://localhost:${PORT}`);
  console.log('POST /api/chat — send { "message": "your question" }');
  console.log('GET  /health — health check');
});
