# Candidex

AI-powered Job Search Operating System. Create tailored "Job Packs" for each application with AI-generated CVs, outreach messages, interview prep, and feedback loops.

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and AI API keys

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Frontend**: Next.js 16 + React 19.2 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Postgres, Auth, Storage) + Next.js Route Handlers
- **AI**: Vercel AI SDK v6 — Claude Sonnet 4.6 + Gemini Flash
- **Deployment**: Vercel + Supabase

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run tests (Vitest) |
| `npm run test:e2e` | E2E tests (Playwright) |
