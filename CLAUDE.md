# CLAUDE.md — Candidex

## Project Overview

Candidex is an AI-powered Job Search Operating System. The core object is a "Job Pack" containing tailored CV, outreach assets, interview prep, and tracking for each job application.

## Non-Negotiable Rules (FATAL IF VIOLATED)

### 1. NO FABRICATION GUARANTEE
- NEVER invent experience, employers, titles, degrees, dates, metrics, skills, or certifications.
- If a job requirement is absent from the Master CV, label it as "Missing Requirement" with honest alternatives.
- Every metric in a rewritten bullet MUST exist in the original source content.

### 2. TRUTH TRACE
- Every rewritten CV bullet MUST have a TruthTraceEntry linking to source_node_ids in the Master CV JSON.
- Truth Trace MUST include: source_node_ids, target_requirement_ids, transformation_type, justification, risk_flags, confidence.
- The verification loop MUST check grounding — fabricated content is flagged and blocked.

### 3. ATS-SAFE EXPORTS
- Single column layout only. NO tables, text boxes, graphics, multi-column, icons, images.
- Standard fonts only: Arial, Calibri, Times New Roman.
- Contact info in body, NOT in headers/footers.
- Export both DOCX and PDF (text-based, parseable).

### 4. STRUCTURED CANONICAL DATA
- Internal format: JSON Resume v1.0.0
- NEVER mutate raw text directly. Always: Ingest → JSON Resume → Mutate JSON → Render to DOCX/PDF.

### 5. RLS MANDATORY
- Every table MUST have Row Level Security enabled.
- Runtime code MUST use `anon` key + JWT. NEVER use `service_role` in runtime code.
- `service_role` is ONLY for migrations and the delete-my-data background job.

## Tech Stack

- Next.js 16 (App Router) + React 19.2 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Auth + Storage)
- Vercel AI SDK v6 (model routing)
- Claude Sonnet 4.6 (complex reasoning) + Gemini Flash (cheap extraction)

## Repo Conventions

### Directory Structure
```
src/app/           — Next.js App Router pages and API routes
src/components/    — React components (ui/, cv/, job-pack/, tracker/)
src/lib/modules/   — Business logic modules (cv-ingest/, job-ingest/, tailor-engine/, etc.)
src/lib/ai/        — AI model router, prompts, schemas
src/lib/supabase/  — Supabase client utilities
src/types/         — TypeScript types (json-resume.ts, truth-trace.ts, etc.)
supabase/          — Migrations and seed data
tests/             — Unit, integration, e2e tests
```

### Naming
- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Types: `PascalCase`
- Functions: `camelCase`
- Database tables: `snake_case`
- API routes: `kebab-case`
- Environment variables: `SCREAMING_SNAKE_CASE`

### Code Style
- Strict TypeScript (`strict: true`)
- Zod for all input validation (server-side)
- Zod for all AI output validation (`generateObject()` schemas)
- No `any` types
- Prefer `const` over `let`
- Always handle errors explicitly

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm test             # All tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
```

## Do / Don't Rules for Agents

### DO:
- Validate all inputs with Zod before processing
- Use the Supabase client with user JWT for all database operations
- Store AI outputs in the database before returning to client
- Cache AI generations using input hash
- Sanitize JD text for prompt injection before passing to AI
- Include Truth Trace for every CV modification
- Run the verification loop after tailoring
- Use structured output (`generateObject()`) for all AI calls
- Write tests for new utilities and business logic

### DON'T:
- Use `service_role` key in any runtime code (API routes, server components)
- Log CV text, personal information, or API keys
- Generate content that isn't grounded in the master CV
- Use tables, graphics, or multi-column layouts in CV exports
- Skip RLS policies on new tables
- Trust JD text — always treat as untrusted input
- Make AI calls without checking the generation cache first
- Store sensitive data in client-side state longer than needed
- Auto-accept bullets flagged with `fabricated_content`
- Use `// @ts-ignore` or `as any` without justification
