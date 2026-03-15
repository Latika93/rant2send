# Rant2Send

Convert emotionally written workplace messages into professional corporate communication. User accounts (Google), credits, and Razorpay payments included. Paste a raw message, choose context and tone, and get three professional rewrites suitable for managers, colleagues, or clients.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, TailwindCSS
- **Backend:** Next.js API routes (Node runtime)
- **Database:** MongoDB Atlas, Mongoose
- **Auth:** NextAuth (Google)
- **Payments:** Razorpay
- **AI:** OpenAI API (GPT-4o, server-side only)
- **Deployment:** Vercel

## Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- OpenAI API key

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` (or use your existing `.env`). Next.js loads both `.env` and `.env.local`.

Required variables:

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key (for GPT-4o) |
| `MONGODB_URI` | MongoDB connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/dbname`) |
| `NEXTAUTH_SECRET` | Secret for NextAuth |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |

Example `.env.local`:

```
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=any_random_string
```

### 3. MongoDB setup

- Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Get the connection string and set `MONGODB_URI`.
- No need to create the `messages` collection manually; the app creates it when the first document is saved.

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push the repo to GitHub (or connect another Git provider).
2. In [Vercel](https://vercel.com), import the project.
3. Add environment variables in Project Settings → Environment Variables: `OPENAI_API_KEY`, `MONGODB_URI`, `NEXTAUTH_SECRET`.
4. Deploy. Vercel will run `next build` and deploy the app.

**Note:** Use a MongoDB Atlas connection string that allows access from the internet (e.g. `0.0.0.0/0` in Network Access for Atlas) so Vercel’s servers can connect.

## Project structure

```
app/
  page.tsx          # Main UI
  layout.tsx
  api/rewrite/route.ts   # POST /api/rewrite
components/
  MessageInput.tsx
  ContextSelector.tsx
  ToneSelector.tsx
  ResultCard.tsx
  Loader.tsx
lib/
  openai.ts
  promptBuilder.ts
  mongodb.ts
models/
  Message.ts
```

## API

**POST /api/rewrite**

Request body:

```json
{
  "message": "Your raw message text",
  "context": "manager|colleague|client|hr|recruiter",
  "tone": "polite|neutral|assertive|diplomatic"
}
```

Response:

```json
{
  "suggestions": ["Professional message 1", "Professional message 2", "Professional message 3"]
}
```

Errors return appropriate status codes (400, 429, 500, 502) with an `error` message in the body.

## License

MIT
