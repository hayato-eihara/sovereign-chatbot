# Sovereign Chatbot

**An open-source AI chatbot widget you can embed in any website in under 5 minutes. RAG-powered, fully customizable.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)

---

## Live Demo

[Try the live demo →](https://your-demo-url.vercel.app) *(placeholder — replace before launch)*

---

## Screenshot

*(Add screenshot here)*

---

## Features

- **🔌 One-line embed** — Single `<script>` tag, works on any website
- **🧠 RAG-powered** — Upload your docs/FAQ, bot answers from your knowledge base
- **🎨 Fully customizable** — Colors, position, avatar, welcome message
- **💬 Conversation logging** — Built-in dashboard to review all conversations
- **🔑 Bring your own API key** — Works with OpenAI GPT-4o-mini (Claude support planned)
- **🌐 Multi-language** — Responds in the user's language automatically
- **⚡ Fast** — Edge Functions + vector similarity search via pgvector

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/your-username/sovereign-chatbot.git
cd sovereign-chatbot
npm install
```

### 2. Set up Supabase

Create a new project at [supabase.com](https://supabase.com), then run this SQL in the SQL editor:

```sql
-- Enable pgvector
create extension if not exists vector;

-- Knowledge base chunks
create table knowledge_chunks (
  id          uuid primary key default gen_random_uuid(),
  content     text not null,
  embedding   vector(1536),
  source      text,
  created_at  timestamptz default now()
);

-- Conversation logs
create table conversations (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz default now()
);

-- HNSW index for fast similarity search
create index on knowledge_chunks using hnsw (embedding vector_cosine_ops);
```

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Add your knowledge base & deploy

Drop Markdown files into `/knowledge`, then run the indexer:

```bash
npm run index-knowledge
```

Deploy to Vercel:

```bash
npx vercel --prod
```

Embed the widget on your site:

```html
<script
  src="https://your-deployment.vercel.app/widget.js"
  data-site-id="your-site-id"
  defer
></script>
```

That's it.

---

## Architecture

```
User
 │
 ▼
Widget (React · Shadow DOM · Vite)
 │  Single <script> tag embed, isolated from host CSS
 │
 ▼
Supabase Edge Function  (/api/chat)
 │  Receives message + session context
 │
 ├──▶ pgvector (HNSW index)
 │      Retrieves top-k knowledge chunks by cosine similarity
 │
 └──▶ OpenAI API (GPT-4o-mini)
        System prompt + retrieved context + conversation history
        │
        ▼
      Response → Widget → User
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Embed | Shadow DOM (style isolation) |
| Backend | Supabase Edge Functions (Deno) |
| Database | PostgreSQL via Supabase |
| Vector Search | pgvector with HNSW index |
| AI — Chat | OpenAI GPT-4o-mini |
| AI — Embeddings | OpenAI text-embedding-3-small |
| Hosting | Vercel |

---

## Self-Hosting Guide

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New project. Note the project URL and anon key from **Settings → API**.

### 2. Run the schema SQL

Paste the SQL from [Quick Start → Step 2](#2-set-up-supabase) into the **SQL Editor**.

### 3. Deploy Edge Functions

```bash
npx supabase functions deploy chat
npx supabase functions deploy index-knowledge
```

Set secrets in the Supabase dashboard under **Settings → Edge Functions → Secrets**:

```
OPENAI_API_KEY=sk-...
```

### 4. Set environment variables

In your Vercel project dashboard → **Settings → Environment Variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```

### 5. Configure your widget

Edit `widget.config.ts`:

```ts
export default {
  siteId: 'your-site-id',
  welcomeMessage: 'Hi! How can I help you today?',
  accentColor: '#6366f1',
  position: 'bottom-right', // 'bottom-left' | 'bottom-right'
  avatarUrl: '/avatar.png',
}
```

---

## Dashboard

The built-in dashboard lets you review every conversation your chatbot has had — useful for identifying gaps in your knowledge base and measuring response quality.

*(Add dashboard screenshot here)*

Access it at `/dashboard` on your deployment. It is protected by Supabase Auth — only authenticated users can view conversations.

---

## Roadmap

- [ ] Claude API support
- [ ] Multiple knowledge base sources (URL scraping, PDF upload)
- [ ] Analytics dashboard (response time, resolution rate)
- [ ] Webhook integrations (Slack, email notifications)
- [ ] Hosted/managed version (no Supabase/Vercel setup required)

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Author

Built by **Hayato Eihara**

- Portfolio: *(placeholder)*
- Twitter/X: [@hayato_builds](https://twitter.com/hayato_builds)
