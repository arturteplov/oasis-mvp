import { memo } from 'react';
import JobCard from './JobCard.jsx';

const JobFeed = ({ jobs, isLoading, openJobId, onToggle, onApply, applyState }) => {
  if (isLoading) {
    return (
      <section className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900/40"
          />
        ))}
      </section>
    );
  }

  if (!jobs.length) {
    return (
      <section className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
        <p className="font-display text-xl font-semibold text-white">No matches yet.</p>
        <p className="mt-2 max-w-md text-sm text-zinc-400">
          Try broadening your search or removing a filter. We&apos;re adding roles daily and feature
          top teams by default.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4 pb-16">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isOpen={openJobId === job.id}
          onToggle={() => onToggle(job.id)}
          onApply={onApply}
          applyState={applyState[job.id]}
        />
      ))}
    </section>
  );
};

export default memo(JobFeed);
