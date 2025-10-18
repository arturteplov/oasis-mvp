const STATUS_STEPS = [
  'Application Delivered',
  'Under Review',
  'Interview stage',
  'Outcome pending',
  'Invitation to Join'
];

const STATUS_LABELS = {
  'Application Delivered': 'Application Delivered',
  'Under Review': 'Under Review',
  'Interview stage': 'Interview stage',
  'Outcome pending': 'Outcome pending',
  'Invitation to Join': 'Invitation to Join'
};

const INVITATION_MESSAGES = {
  default: 'Not yet',
  offer: 'Hiring team just sent you an offer to your email',
  decline: 'Hiring team decided to proceed with another candidate. Keep applying to other roles.'
};

const normalizeInvitationMessage = (note = '') => {
  const lowered = note.toLowerCase();
  if (lowered.includes('decline') || lowered.includes('not a fit') || lowered.includes('regret')) {
    return INVITATION_MESSAGES.decline;
  }
  if (lowered.includes('offer') || lowered.includes('invite') || lowered.includes('welcome')) {
    return INVITATION_MESSAGES.offer;
  }
  return INVITATION_MESSAGES.default;
};

const canonicalStatus = (status) => {
  if (status === 'Pending applicant decision' || status === 'Invitation to Join') {
    return 'Invitation to Join';
  }
  if (status === "Doesn’t meet criteria") {
    return 'Invitation to Join';
  }
  return status;
};

const StatusTracker = ({ statusHistory }) => {
  const normalizedHistory = (statusHistory ?? []).map((entry) => ({
    ...entry,
    originalStatus: entry.status,
    status: canonicalStatus(entry.status)
  }));

  const latestEntry = normalizedHistory[normalizedHistory.length - 1] ?? {
    status: STATUS_STEPS[0],
    note: ''
  };
  const latest = latestEntry.status;

  return (
    <div className="flex flex-col gap-4">
      <ol className="grid gap-3 md:grid-cols-3 md:gap-6">
        {STATUS_STEPS.map((status) => {
          const reached = STATUS_STEPS.indexOf(status) <= STATUS_STEPS.indexOf(latest);
          const completed = normalizedHistory.some((entry) => entry.status === status);
          const active = latest === status;
          const label = STATUS_LABELS[status] ?? status;
          const message = (() => {
            if (status === 'Invitation to Join') {
              if (latest === 'Invitation to Join') {
                if (latestEntry.originalStatus === "Doesn’t meet criteria") {
                  return INVITATION_MESSAGES.decline;
                }
                if (latestEntry.originalStatus === 'Pending applicant decision') {
                  return INVITATION_MESSAGES.offer;
                }
                return normalizeInvitationMessage(latestEntry.note);
              }
              return INVITATION_MESSAGES.default;
            }
            return completed ? 'Yes' : 'Not yet';
          })();

          return (
            <li
              key={status}
              className={`relative rounded-2xl border p-4 ${
                completed
                  ? 'border-oasis-primary/60 bg-oasis-primary/5 text-white'
                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
              } ${active ? 'ring-2 ring-oasis-primary/50' : ''}`}
            >
              <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
              <div className="mt-2 text-sm text-zinc-200">{message}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default StatusTracker;
