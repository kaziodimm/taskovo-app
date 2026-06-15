# Taskovo Supabase Auth + Resend setup

This project uses Supabase Auth with email + password, email confirmation, password recovery and a server-side confirmation route.

## Project

- Supabase project: `taskovo-dev`
- Project ref: `bqalqfshewhpuxsmveiy`
- Supabase URL: `https://bqalqfshewhpuxsmveiy.supabase.co`
- Production site: `https://taskovo.cz`

## Required Vercel environment variables

```text
NEXT_PUBLIC_SITE_URL=https://taskovo.cz
NEXT_PUBLIC_SUPABASE_URL=https://bqalqfshewhpuxsmveiy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
TASKOVO_ADMIN_EMAIL=...
TASKOVO_ADMIN_PASSWORD=...
```

`NEXT_PUBLIC_SITE_URL` is important because registration and password recovery emails use it to build production redirect URLs.

## Supabase Auth URL configuration

Open Supabase Dashboard -> Authentication -> URL Configuration.

Set:

```text
Site URL: https://taskovo.cz
```

Add redirect URLs:

```text
https://taskovo.cz/auth/confirm
https://taskovo.cz/dashboard
https://taskovo.cz/poskytovatel/dashboard
https://taskovo.cz/nove-heslo
https://taskovo-app.vercel.app/auth/confirm
https://taskovo-app.vercel.app/dashboard
https://taskovo-app.vercel.app/poskytovatel/dashboard
https://taskovo-app.vercel.app/nove-heslo
```

## Supabase Auth provider settings

Open Supabase Dashboard -> Authentication -> Providers -> Email.

Recommended beta settings:

```text
Enable Email provider: on
Confirm email: on
Secure email change: on
Minimum password length: 8 or higher
```

If available on the current Supabase plan, also enable leaked password protection.

## Resend SMTP settings

Open Supabase Dashboard -> Authentication -> SMTP Settings.

Use the SMTP credentials from Resend for the verified Taskovo domain.

Typical Resend SMTP values:

```text
Host: smtp.resend.com
Port: 587
Username: resend
Password: <Resend SMTP/API key>
Sender email: noreply@taskovo.cz
Sender name: Taskovo
```

Disable click/open tracking for auth emails if Resend tracking is enabled. Supabase auth links are single-use and link tracking can break them.

## Email templates

Open Supabase Dashboard -> Authentication -> Email Templates.

Use these files:

```text
docs/email-templates/confirm-signup.html
docs/email-templates/reset-password.html
docs/email-templates/password-changed.html
```

Subjects:

```text
Confirm signup: Potvrďte svůj účet Taskovo
Reset password: Obnova hesla k účtu Taskovo
Password changed notification: Heslo k účtu Taskovo bylo změněno
```

The confirmation and recovery templates intentionally use:

```html
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}
```

This is required for the server-side PKCE flow used by Next.js.

## Rate limits and anti-spam

Open Supabase Dashboard -> Authentication -> Rate Limits.

Recommended beta baseline:

```text
Signup email resend window: keep default or 60 seconds
Password recovery resend window: keep default or 60 seconds
Anonymous signups: keep restricted
Email sending per hour: keep conservative during beta
```

Application-level protection already blocks creating multiple Taskovo profiles for the same email.

## Test checklist

1. Register a new client with a real email.
2. Confirm that a Taskovo confirmation email arrives from the Taskovo domain.
3. Click the confirmation button.
4. Confirm that the user lands in `/dashboard`.
5. Log out and log in with email + password.
6. Use `Zapomenuté heslo`.
7. Click the reset email.
8. Set a new password on `/nove-heslo`.
9. Log in with the new password.
10. Try registering with the same email again and confirm the duplicate-email message appears.
