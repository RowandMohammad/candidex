---
description: Global rules for all agents working on Candidex
---

# Candidex — Global Agent Rules

## Non-Negotiable Constraints

1. **No Fabrication**: Never invent experience, employers, titles, degrees, dates, metrics, skills, or certifications. If a requirement is missing from the CV, label it as "Missing Requirement" with honest alternatives.

2. **Truth Trace**: Every rewritten CV bullet must have a TruthTraceEntry with source_node_ids, transformation_type, justification, risk_flags, and confidence. Run the verification loop on every tailoring output.

3. **ATS-Safe Exports**: Single column, no tables/graphics/multi-column. Standard fonts only (Arial, Calibri, Times New Roman). Contact info in body, not headers/footers.

4. **JSON Resume Canonical Format**: All CV mutations happen on JSON Resume v1.0.0 structured data, never raw text. Flow: ingest → JSON Resume → mutate → render.

5. **RLS Always On**: Every table must have Row Level Security enabled. Runtime code uses `anon` key + JWT only. `service_role` is restricted to migrations and delete-my-data.

## Code Quality

- TypeScript strict mode. No `any` types without justification.
- Zod validation for all API inputs and AI outputs.
- Sanitize JD text for prompt injection before AI calls.
- Check generation cache before making AI calls.
- Write tests for new business logic.
- Never log PII (CV text, personal info, API keys).

## Architecture

- Business logic lives in `src/lib/modules/` (not in API routes or components).
- AI prompts live in `src/lib/ai/prompts/`.
- Zod schemas for AI output live in `src/lib/ai/schemas/`.
- API routes are thin handlers: validate → call module → return response.
- Components in `src/components/` are reusable; page-specific layout lives in `src/app/`.

## Testing

- Unit tests: `tests/unit/` (Vitest)
- Integration tests: `tests/integration/` (Vitest)
- E2E tests: `tests/e2e/` (Playwright)
- Run `npm test` before committing.
