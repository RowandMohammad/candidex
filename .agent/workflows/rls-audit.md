---
description: Row Level Security audit workflow for Supabase database
---

# RLS Audit Workflow

## When to Run

- After every database migration
- When adding new tables
- When modifying RLS policies
- Before every deployment

## Steps

### 1. Verify RLS is Enabled on All Tables

Run in Supabase SQL editor or via `supabase db lint`:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'users_profile', 'master_cvs', 'job_packs', 'job_intelligence',
  'tailored_cvs', 'outreach_assets', 'prep_packs', 'interview_logs',
  'generation_cache', 'audit_events', 'deletion_requests'
);
```

**Expected**: All `rowsecurity = true`

### 2. Verify All Tables Have Policies

```sql
SELECT 
  t.tablename,
  array_agg(p.cmd) as policy_cmds
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
AND t.tablename NOT LIKE 'pg_%'
GROUP BY t.tablename;
```

**Expected**: Every table has policies for SELECT, INSERT, UPDATE, DELETE

### 3. Check for Tables Without Policies

```sql
SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
AND p.policyname IS NULL
AND t.tablename NOT LIKE 'pg_%';
```

**Expected**: Empty result (no unprotected tables)

### 4. Cross-User Isolation Test

```sql
-- Set session as test User A
SET LOCAL role TO 'authenticated';
SET LOCAL request.jwt.claims TO '{"sub": "test-user-a-uuid"}';

-- Attempt to read test User B's data
SELECT count(*) FROM job_packs WHERE user_id = 'test-user-b-uuid';
-- Expected: 0

-- Attempt to insert into test User B's space
INSERT INTO job_packs (user_id, company_name, role_title, jd_raw_text)
VALUES ('test-user-b-uuid', 'Attacker', 'Hack', 'test');
-- Expected: FAIL (policy violation)
```

### 5. Verify Storage Bucket Policies

- Check that `cv-originals` and `cv-exports` buckets are private (not public)
- Check that storage policies restrict access by user_id folder prefix
- Attempt to access another user's file via signed URL (should fail)

### 6. Verify service_role Usage

// turbo
```bash
grep -r "service_role\|SERVICE_ROLE" src/ --include="*.ts" --include="*.tsx" -l
```

**Expected**: Only `src/lib/supabase/admin.ts` (if it exists). No other files.

## Remediation

If any check fails:
1. Stop deployment
2. Fix the RLS policy or code issue
3. Re-run the full audit
4. Only deploy after all checks pass
