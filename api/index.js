/**
 * Root handler so GET / returns something (avoids NOT_FOUND on Vercel).
 */
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN || '*');
  res.status(200).json({
    service: 'portfolio-chatbot',
    message: 'API is running. Use POST /api/chat with body { "message": "your question" }. Health: GET /api/health',
    endpoints: {
      chat: 'POST /api/chat',
      health: 'GET /api/health',
    },
  });
};
