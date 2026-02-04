# Portfolio Chatbot API

A simple API that answers **only** questions about **Muhammad Umair** (portfolio, experience, skills, projects, contact). Powered by OpenAI; you provide your API key.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env`** (copy from `.env.example`)
   - Add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
   - Optional: `OPENAI_MODEL` (default: `gpt-4o-mini`), `PORT` (default: `3000`).

3. **Run the server**
   ```bash
   npm start
   ```
   Or with auto-restart: `npm run dev`

## Testing in Postman

- **URL:** `POST http://localhost:3000/api/chat`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "message": "What is Muhammad Umair's experience?"
  }
  ```
- **With conversation history (optional):**
  ```json
  {
    "message": "What are his main skills?",
    "history": [
      { "role": "user", "content": "Who is Muhammad Umair?" },
      { "role": "assistant", "content": "Muhammad Umair is..." }
    ]
  }
  ```

**Health check:** `GET http://localhost:3000/health`

## Response format

- Success: `{ "success": true, "reply": "...", "usage": { ... } }`
- Error: `{ "success": false, "error": "..." }`

The chatbot is instructed to answer only about Muhammad Umair; other topics are politely declined.

---

## Deploy to Vercel (for your frontend to call)

**1. Create a new repo on GitHub**
- Go to [GitHub](https://github.com/new), create an empty repo (e.g. `portfolio-chatbot-api`). Do not add a README if the project already has one.

**2. Push this code to that repo**
- From the Chatbot folder:
  ```bash
  git init
  git add .
  git commit -m "Portfolio chatbot API"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
  git push -u origin main
  ```
- Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name.

**3. Deploy on Vercel**
- Go to [vercel.com](https://vercel.com), sign in with GitHub.
- **Import** the repo you just pushed.
- In **Environment Variables**, add:
  - `OPENAI_API_KEY` = your OpenAI key (required).
  - Optional: `OPENAI_MODEL`, `FRONTEND_ORIGIN` (e.g. `https://your-portfolio.vercel.app` to restrict CORS).
- Deploy. Vercel will give you a URL like `https://portfolio-chatbot-api-xxx.vercel.app`.

**4. Use from your Vercel frontend**
- **Chat:** `POST https://YOUR-DEPLOYED-URL.vercel.app/api/chat`  
  Body: `{ "message": "your question" }`  
  Headers: `Content-Type: application/json`
- **Health:** `GET https://YOUR-DEPLOYED-URL.vercel.app/api/health`
- CORS is allowed for all origins by default. To restrict to your frontend, set `FRONTEND_ORIGIN` in Vercel to your portfolio URL.

You keep the same API contract: the frontend just hits the Vercel URL instead of `localhost`.
