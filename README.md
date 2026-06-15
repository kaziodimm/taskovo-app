# Taskovo App

Production web app foundation for Taskovo, a Czech local-services marketplace.

## Stack

- Next.js
- Supabase PostgreSQL
- Supabase Auth-ready schema
- Vercel hosting

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env.local
```

3. Fill:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
TASKOVO_ADMIN_EMAIL
TASKOVO_ADMIN_PASSWORD
```

4. Apply the SQL from:

```text
supabase/001_initial_schema.sql
```

5. Run:

```bash
npm run dev
```

## Deploy

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Add the same environment variables in Vercel.
4. Deploy.

## Auth and Email

Supabase Auth uses email + password, email confirmation and password recovery.

Setup guide and email templates:

```text
docs/supabase-auth-setup.md
docs/email-templates/confirm-signup.html
docs/email-templates/reset-password.html
docs/email-templates/password-changed.html
```

## Notes

The production foundation supports:

- creating tasks;
- listing open tasks;
- submitting offers;
- registering clients and taskers;
- email confirmation and password recovery;
- basic admin overview.
