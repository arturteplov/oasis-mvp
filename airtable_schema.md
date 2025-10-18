# Airtable Base — Oasis Applicant Review

## Table: `Applicants`
| Field | Type | Notes |
|-------|------|-------|
| `Application ID` | Single line text | Supabase `applications.id` |
| `Tracker token` | Single line text (primary field) | Unique link fragment for status page |
| `Candidate name` | Single line text | |
| `Email` | Email | |
| `Role` | Single line text | Sync from Supabase `jobs.title` |
| `Company` | Single line text | |
| `Status` | Single select | `Application Delivered`, `Under Review`, `Shortlist`, `Interview completed`, `Outcome pending`, `Doesn't meet criteria`, `Invitation to Join`, `Archive` |
| `Video URL` | URL | Supabase signed URL (generated per view) |
| `Text response` | Long text | Optional written fallback |
| `Work authorization` | Single select | Citizen / Work permit / No documents |
| `Applied at` | Date | Supabase `created_at` |
| `Last action note` | Long text | Sync from Supabase `actions.note` |
| `Reviewer` | Collaborator | HR teammate owning next step |
| `Tags` | Multiple select | `In progress`, `Potential match`, etc. |

## Table: `Actions`
| Field | Type | Notes |
|-------|------|-------|
| `Action ID` | Single line text | Supabase `actions.id` |
| `Tracker token` | Linked record → Applicants | |
| `Action type` | Single select | Seen, Shortlist, Interview scheduled, Rejected, Archive |
| `Performed by` | Collaborator | HR reviewer |
| `Note` | Long text | Context for Zapier emails |
| `Created at` | Date | |

## Views
- **Today’s queue**: Filter `Status` is `Application Delivered` or `Under Review`, sort by `Applied at` ascending.
- **Needs scheduling**: `Status` is `Shortlist`.
- **Closed loop**: `Status` is any of `Doesn't meet criteria`, `Invitation to Join`.

## Automations
- When `Status` changes in Airtable → Call Zapier webhook with `{ tracker_token, status, note }`.
- When record moves to `Shortlist` → auto-fill `Last action note` “Calendly link sent”.
- Reminder automation: if `Status` still `Application Delivered` after 24h → Slack/Email ping.

## Permissions
- Lock base to invited HR reviewers.
- Enable audit log (Pro plan) for timeline insights.
