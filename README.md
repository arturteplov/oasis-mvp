# Oasis MVP — Video-first Applicant Flow

## 1. Run the project locally
```bash
npm install
npm run dev
```

> Dependencies are pinned in `package.json`. If you are offline, run `npm install --offline` with a cached registry or use `pnpm/yarn` mirrors.

Create `.env` with your Supabase keys:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=public-anon-key
VITE_ZAPIER_NEW_APP=https://hooks.zapier.com/...    # acknowledgement email zap
VITE_ZAPIER_STATUS_UPDATE=https://hooks.zapier.com/...  # status-change zap (optional)
```

## 2. Application flow overview
- **Home job board (`/`)**: left filters + top search + center job snapshots. Trending roles load even with no filters.
- **Apply in place**: expanding a card reveals the form, consent checkbox, and video/text fallbacks. No modal, no navigation away.
- **Video mitigation**:
  1. Auto-detect recorder support, fall back to upload.
  2. Text response escape hatch with same behavioral prompt.
  3. “Continue on your phone” link copies a handoff URL.
- **Tracker (`/tracker?token=...`)**: tokenized link shows status ladder with activity log and polls Supabase every 10 seconds.
- **HR Inbox (`/hr`)**: reads live applications from Supabase, generates signed video URLs, and lets reviewers push status updates (which log an action row and trigger Zapier if configured).

## 3. Data + integrations
- Schema lives in `supabase_schema.sql`. Run it in Supabase SQL editor, enable RLS, then connect Zapier via webhook or native connector.
- Automation recipes and email templates: see `zapier_config.md`.
- Airtable base structure + fields: `airtable_schema.md`.
- Frontend reads live data from Supabase via the hooks in `src/lib/useJobBoardData.js`, `src/lib/useTrackerData.js`, and `src/lib/useHRMockData.js`. Storage uploads land in the `videos` bucket and signed URLs are generated on demand.

## 4. Metrics to track (MVP pilot)
- Completion rates: `submission_mode` + timestamp fields in Supabase.
- SLA integrity: trigger Zap when `status` untouched after 24h.
- Candidate/HR satisfaction: store Typeform/Google Form links in SendGrid templates.
- Funnel: visitors ⇒ apply start ⇒ video/text submitted ⇒ HR watched ⇒ shortlist ⇒ scheduled.

## 5. Next steps checklist
1. Deploy frontend (Netlify/Vercel) — add environment vars + Supabase anon key.
2. Create Supabase Storage bucket `videos` with signed-url policy.
3. Stand up SendGrid templates (`apply_received`, `status_seen`, `shortlist_invite`, `respectful_decline`, `weekly_digest`).
4. Build Zapier Zaps and test each status change end-to-end.
5. Invite HR reviewers to Airtable, run 3-5 real candidate flows, collect survey data.

## 6. Known gaps for pilot
- Tracker tokens are locally generated; secure with a Supabase edge function that issues 7-day signed tokens before shipping.
- Email + scheduling flows are outlined but not yet wired — requires Zapier/Calendly credentials.
- Accessibility copy uses English only; add localization if targeting multilingual audiences.

## 7. Deploy to Netlify
```bash
npm run build
netlify deploy --prod
```

Add the environment variables from `.env` in the Netlify dashboard (Site settings → Build & deploy → Environment). Point `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`, `VITE_ZAPIER_NEW_APP`, and `VITE_ZAPIER_STATUS_UPDATE` at the production credentials before triggering the deploy.

## Status Update (Oct 23, 2025)
- Oasis MVP is paused while we pivot; latest context lives at https://notion.so/oasis-pivot.
