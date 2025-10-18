import classNames from 'classnames';

const STATUS_LABELS = {
  'Application Delivered': 'Pending',
  "Pending applicant decision": "Pending applicant's decision"
};

const STATUS_COLORS = {
  'Application Delivered': 'bg-zinc-800 text-zinc-300 border-zinc-700',
  'Under Review': 'bg-blue-500/10 text-blue-300 border-blue-500/40',
  'Interview stage': 'bg-purple-500/10 text-purple-300 border-purple-500/40',
  'Outcome pending': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
  "Pending applicant decision": 'bg-amber-500/10 text-amber-200 border-amber-400/60',
  'Invitation to Join': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
  'Doesn’t meet criteria': 'bg-red-500/10 text-red-300 border-red-500/40',
  'In progress': 'bg-oasis-primary/10 text-oasis-primary border-oasis-primary/40',
  Archive: 'bg-zinc-800 text-zinc-400 border-zinc-700'
};

const StatusBadge = ({ status }) => (
  <span
    className={classNames(
      'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
      STATUS_COLORS[status] ?? 'bg-zinc-800 text-zinc-300 border-zinc-700'
    )}
  >
    {STATUS_LABELS[status] ?? status}
  </span>
);

export default StatusBadge;
