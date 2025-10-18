# Zapier Automations — Oasis MVP

## 1. Acknowledgement Email (Applications → SendGrid)
- **Trigger**: Supabase `applications` table — new row
- **Action**: SendGrid — send transactional email using template `apply_received`
- **Template data**:
  - `candidate_name`
  - `role_title`
  - `status_link` (build as `https://oasis.com/tracker/{{tracker_token}}`)
  - `response_sla` (“24–48 hours”)
- **Notes**:
  - Use Supabase webhook trigger via Zapier built-in connector.
  - Store SendGrid API key as Zapier secret. No backend required.

## 2. Status Updates (Airtable/Supabase Sync → SendGrid)
- **Trigger**: Airtable base “Oasis Applicants” — record updated (Status field)
- **Lookup**: Supabase `applications` by `tracker_token`
- **Action**: SendGrid template based on status:
  - `Seen` → template `status_seen`
  - `Shortlist` → template `shortlist_invite` (include Calendly/TidyCal link)
  - `Doesn't meet criteria` → template `respectful_decline`
- **Additional fields**:
  - `status_note` (optional free text from Airtable)
  - `scheduler_link` (for shortlist)

## 3. Weekly HR Digest
- **Trigger**: Schedule — every Monday 8am local (Zapier Schedule)
- **Action**:
  1. Supabase — query `applications` where `status = 'Application Delivered'`
  2. Formatter — aggregate count + top roles
  3. SendGrid — template `weekly_digest` to recruiter email (from jobs table)

## 4. Survey Collection (Optional)
- **Trigger**: Google Forms response (candidate or HR)
- **Action**: Slack/Email notification + append to Airtable “Feedback” table.

### SendGrid Templates (minimum)
1. `apply_received` — acknowledgement with tracker link.
2. `status_seen` — reassure application is being reviewed.
3. `shortlist_invite` — contains calendly link placeholder.
4. `respectful_decline` — empathetic pass with survey link.
5. `weekly_digest` — counts of pending videos + nudge CTA.

### Supabase Webhooks Setup
1. Create database trigger on `applications` insert/update.
2. Push to Zapier Catch Hook (if Supabase connector unavailable); include payload:
   ```json
   {
     "id": "...",
     "job_id": "...",
     "name": "...",
     "email": "...",
     "status": "...",
     "tracker_token": "...",
     "submission_mode": "video|upload|text"
   }
   ```

### Data Hygiene Checklist
- Store Zap IDs and webhook URLs in `.env` (use `VITE_ZAPIER_*` when needed).
- Log Zap runs for audit (Zapier task history).
- Ensure SendGrid sandbox mode disabled before pilot.
