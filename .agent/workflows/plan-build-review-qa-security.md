---
description: Standard workflow for planning, building, reviewing, QA testing, and security auditing a feature
---

# Plan → Build → Review → QA → Security Workflow

## 1. Plan

- Read the relevant spec artifacts (ARCHITECTURE.md, DATA_MODEL.md, API_CONTRACTS.md, PROMPT_PIPELINES.md, etc.)
- Identify which module(s) are affected
- Check TASKS.md for the relevant milestone tasks
- Write a brief plan of files to create/modify
- Get approval before proceeding

## 2. Build

- Create/modify files according to plan
- Follow global rules (no fabrication, Truth Trace, ATS-safe, RLS)
- Validate with TypeScript (`npm run typecheck`)
- Lint with ESLint (`npm run lint`)

// turbo
## 3. Typecheck
```bash
npm run typecheck
```

// turbo
## 4. Lint
```bash
npm run lint
```

## 5. Review

- Run the code review workflow (`.agent/workflows/code-review.md`)
- Check for non-negotiable rule violations
- Verify Zod validation on inputs and AI outputs
- Verify no `service_role` usage in runtime code

## 6. QA

- Write unit tests for new business logic
- Write integration tests for new API routes
- Run all tests:

// turbo
```bash
npm test
```

- If UI changes, verify in browser at `http://localhost:3000`

## 7. Security

- Run the RLS audit workflow (`.agent/workflows/rls-audit.md`)
- Check for prompt injection vulnerabilities in new AI pipelines
- Verify rate limiting on new endpoints
- Check for PII logging

## 8. Update Progress

- Update TASKS.md: mark completed items with `[x]`
- Commit with descriptive message
