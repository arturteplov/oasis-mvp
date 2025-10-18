import { useMemo, useState } from 'react';
import { useHRMockData } from '../lib/useHRMockData.js';
import StatusBadge from '../components/StatusBadge.jsx';
import VideoPreview from '../components/VideoPreview.jsx';

const TABS = [
  { id: 'new', label: 'New', statuses: ['Application Delivered', 'Under Review'] },
  { id: 'pending', label: 'Pending interviews', statuses: ['Interview stage'] },
  { id: 'shortlisted', label: 'Shortlisted', statuses: ['Outcome pending'] },
  { id: 'offer', label: 'Offer sent', statuses: ['Pending applicant decision', 'Invitation to Join'] },
  { id: 'decline', label: "Doesn't meet criteria", statuses: ["Doesn’t meet criteria"] }
];

const HRDashboardMock = () => {
  const { applicants, updateStatus } = useHRMockData();
  const [activeTab, setActiveTab] = useState('new');

  const grouped = useMemo(() => {
    const base = Object.fromEntries(TABS.map((tab) => [tab.id, []]));
    for (const applicant of applicants) {
      const match = TABS.find((tab) => tab.statuses.includes(applicant.status)) ?? TABS[0];
      base[match.id].push(applicant);
    }
    return base;
  }, [applicants]);

  const visibleApplicants = grouped[activeTab] ?? [];
  const activeCount = ['new', 'pending', 'shortlisted', 'offer'].reduce(
    (sum, id) => sum + (grouped[id]?.length ?? 0),
    0
  );
  const isDeclineTab = activeTab === 'decline';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-display text-2xl font-semibold">Oasis Review Inbox</h1>
            <p className="text-sm text-zinc-400">
              You can watch candidate videos, tag outcomes, and trigger follow-ups in under 5 minutes.
            </p>
          </div>
          <div className="flex gap-2 text-xs text-zinc-400">
            <span>🔥 {activeCount} candidates in play</span>
            <span>We recommend responding within 24-48h</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                activeTab === tab.id
                  ? 'border-oasis-primary bg-oasis-primary/10 text-oasis-primary'
                  : 'border-zinc-700 text-zinc-400 hover:border-oasis-primary/60 hover:text-white'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs text-zinc-500">{grouped[tab.id]?.length ?? 0}</span>
            </button>
          ))}
        </div>

        {visibleApplicants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center text-sm text-zinc-500">
            No candidates in this stage yet.
          </div>
        ) : (
          <div className="grid gap-6">
            {visibleApplicants.map((applicant) => {
              const card = (
                <div
                  key={applicant.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl shadow-black/60"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-oasis-primary/20 font-display text-lg font-semibold text-oasis-primary">
                          {applicant.name.charAt(0)}
                        </div>
                        <div>
                          <h2 className="font-semibold text-white">{applicant.name}</h2>
                          <p className="text-sm text-zinc-400">{applicant.email}</p>
                        </div>
                        <StatusBadge status={applicant.status} />
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <dl className="grid gap-2 text-sm text-zinc-300 md:grid-cols-2">
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-zinc-500">Role</dt>
                            <dd className="font-medium text-white">{applicant.jobTitle}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-zinc-500">Applied</dt>
                            <dd>{new Date(applicant.appliedAt).toLocaleString()}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-zinc-500">Work auth</dt>
                            <dd>{applicant.workAuth}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-zinc-500">Tags</dt>
                            <dd className="flex flex-wrap gap-2 text-xs">
                              {applicant.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-oasis-primary/10 px-2 py-1 text-oasis-primary"
                                >
                                  {tag}
                                </span>
                              ))}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                    <VideoPreview
                      url={applicant.videoUrl}
                      transcript={applicant.textResponse}
                      onPlay={() => {
                        if (applicant.status === 'Application Delivered') {
                          updateStatus(applicant.trackerToken, 'Under Review');
                        }
                      }}
                    />
                  </div>
                  {applicant.jobPromptBody && (
                    <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Prompt</p>
                      <h3 className="mt-1 font-semibold text-white">{applicant.jobPromptTitle}</h3>
                      <p className="mt-3 text-sm text-zinc-300">{applicant.jobPromptBody}</p>
                    </div>
                  )}
                  {applicant.resumeUrl && (
                    <div className="mt-4">
                      <a
                        href={applicant.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:border-oasis-primary hover:text-white"
                      >
                        Download resume/CV
                      </a>
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateStatus(applicant.trackerToken, 'Interview stage')}
                      className="rounded-full border border-oasis-primary/40 px-4 py-2 text-sm font-semibold text-oasis-primary transition hover:border-oasis-primary hover:text-white"
                    >
                      Quick-set up an interview
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(applicant.trackerToken, 'Outcome pending')}
                      className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)] transition hover:bg-emerald-500/20 hover:text-white hover:shadow-[0_0_18px_rgba(16,185,129,0.55)]"
                    >
                      Shortlist
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(applicant.trackerToken, 'Pending applicant decision', { noteOverride: 'offer' })}
                      className="rounded-full border border-amber-400/60 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20 hover:text-white"
                    >
                      Send offer
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          applicant.trackerToken,
                          isDeclineTab ? 'Application Delivered' : 'Doesn’t meet criteria',
                          { noteOverride: isDeclineTab ? 'reopened' : 'decline' }
                        )
                      }
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        isDeclineTab
                          ? 'border-oasis-primary/30 text-oasis-primary hover:border-oasis-primary hover:text-white'
                          : 'border-zinc-700 text-zinc-300 hover:border-red-500 hover:text-red-400'
                      }`}
                    >
                      {isDeclineTab ? 'Reopen' : 'Grateful decline'}
                    </button>
                  </div>
                </div>
              );

              return card;
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default HRDashboardMock;
