# Prem Shinde — Portfolio

TanStack Start (React) + Supabase, deployed on Vercel. No Lovable dependency.

## Setup
1. Create a Supabase project. In its SQL Editor run `setup/1-setup.sql`
   (optionally `setup/2-restore-from-backup.sql` if restoring from a backup).
2. Copy `.env.example` to `.env` for local development and fill in the values.
3. `npm install` then `npm run dev`.

## Deploy (Vercel)
- Framework Preset: Other · Build Command: `npm run build` · Output Directory: empty
- Add the variables from `.env.example` in Vercel → Settings → Environment Variables.
- In Supabase → Authentication → URL Configuration add your site URL and `https://<your-domain>/**`.

Never commit `.env` or the `service_role` key.
