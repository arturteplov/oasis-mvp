import { motion, AnimatePresence } from 'framer-motion';
import ApplyPanel from './ApplyPanel.jsx';
import Pill from './Pill.jsx';
import { getJobIcon } from '../lib/jobIcons';

const JobCard = ({ job, isOpen, onToggle, onApply, applyState }) => {
  return (
    <article className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/70 shadow-2xl shadow-black/60 transition hover:border-oasis-primary/50">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 px-6 py-6 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-zinc-950/80">
          {getJobIcon(job.iconKey)}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              {job.title}{' '}
              <span className="text-sm font-medium text-zinc-400">· {job.company}</span>
            </h2>
            <p className="text-sm text-zinc-400">
              {job.location} · {job.timeline}
            </p>
          </div>
          <p className="text-sm text-zinc-200">{job.snapshot}</p>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <Pill key={tag} label={tag} />
            ))}
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950/80 text-zinc-400">
          <span className="text-xl">{isOpen ? '−' : '+'}</span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeInOut' }}
            className="border-t border-zinc-800 bg-zinc-950/60"
          >
            <ApplyPanel job={job} onApply={onApply} applyState={applyState} />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};

export default JobCard;
