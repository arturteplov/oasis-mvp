import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import StatusTracker from '../components/StatusTracker.jsx';
import { useTrackerData } from '../lib/useTrackerData.js';

const Tracker = () => {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = useMemo(
    () => paramToken ?? searchParams.get('token') ?? '',
    [paramToken, searchParams]
  );
  const { statusHistory, isLoading, job, applicant } = useTrackerData(token);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-6">
          <h1 className="font-display text-2xl font-semibold">Track your application</h1>
          <p className="text-sm text-zinc-400">
            You can bookmark this page to follow updates. We&apos;ll email you whenever there&apos;s new activity.
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl shadow-black/60">
          {isLoading ? (
            <p className="text-sm text-zinc-400">Loading your application status...</p>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Position</p>
                <h2 className="font-display text-xl font-semibold text-white">
                  {job?.title ?? 'Role'}
                </h2>
                <p className="text-sm text-zinc-400">{job?.location}</p>
              </div>
              <StatusTracker statusHistory={statusHistory} />
              <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/70 p-5">
                <h3 className="font-medium text-white">Updates from the team</h3>
                <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                  {statusHistory.length === 0 ? (
                    <li>No updates yet. We promised to review within 48 hours.</li>
                  ) : (
                    statusHistory.map((entry) => (
                      <li key={entry.timestamp}>
                        <span className="font-semibold text-white">{entry.status}</span> —{' '}
                        {entry.note ?? 'Status moved forward.'}{' '}
                        <span className="text-xs text-zinc-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <footer className="mt-8 text-xs text-zinc-500">
                Logged in as{' '}
                <span className="font-medium text-white">{applicant?.email ?? 'applicant@email'}</span>.
                If you need help, you can email support@oasis.com.
              </footer>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Tracker;
