---
description: Code review checklist for Candidex changes
---

# Code Review Workflow

## Checklist

### Non-Negotiables
- [ ] No fabrication: AI outputs do not invent experience, metrics, or skills
- [ ] Truth Trace: every tailored bullet has a TruthTraceEntry with source_node_ids
- [ ] ATS-safe: no tables, graphics, multi-column in export code
- [ ] RLS: new tables have RLS enabled + policies for all CRUD operations
- [ ] No `service_role` in runtime code (check imports of admin.ts)

### Input Validation
- [ ] All API inputs validated with Zod schemas
- [ ] JD text sanitized for prompt injection before AI calls
- [ ] File uploads checked for type and size limits
- [ ] Rate limiting applied on generation endpoints

### AI Pipeline Quality
- [ ] Structured output via `generateObject()` with Zod schema
- [ ] Generation cache checked before making AI call
- [ ] System prompt precedes all user/JD content
- [ ] JD text fenced in `<job_description>` XML tags
- [ ] Output validated against schema before database storage

### Data Security
- [ ] No PII logged (CV text, email, phone, names)
- [ ] API keys not exposed to client-side code
- [ ] Supabase client uses user JWT (anon key), not service_role
- [ ] Storage access via signed URLs only (no public buckets)
- [ ] Error messages don't leak internal details

### Code Quality
- [ ] TypeScript strict mode — no `any` without justification
- [ ] No `// @ts-ignore` without explanation
- [ ] Functions are small and single-purpose
- [ ] Business logic in `src/lib/modules/`, not in routes or components
- [ ] Proper error handling (try/catch, error boundaries)

### Testing
- [ ] Unit tests for new utility functions
- [ ] Integration tests for new API routes
- [ ] Existing tests still pass (`npm test`)
