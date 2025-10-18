import { JOBS, STATUS_FLOW } from '../data/jobs.js';
import { generateTrackerToken } from './tokens.js';

const applications = [];
const trackerByToken = new Map();

const getJobById = (jobId) => JOBS.find((job) => job.id === jobId);

const buildStatusEntry = (status, note = '') => ({
  status,
  note,
  timestamp: new Date().toISOString()
});

const seedApplication = ({
  name,
  email,
  jobId,
  statusIndex,
  videoUrl,
  textResponse,
  workAuth = 'Citizen'
}) => {
  const token = generateTrackerToken();
  const job = getJobById(jobId);
  const statusHistory = STATUS_FLOW.slice(0, statusIndex + 1).map((status, index) =>
    buildStatusEntry(
      status,
      index === 0
        ? 'Application submitted'
        : status === 'Interview stage'
        ? '30 min conversation scheduled'
        : status === 'Outcome pending'
        ? 'Reviewing final feedback'
        : ''
    )
  );

  const applicationRecord = {
    id: token,
    jobId,
    name,
    email,
    status: STATUS_FLOW[Math.min(statusIndex, STATUS_FLOW.length - 1)],
    videoUrl,
    textResponse,
    workAuth,
    createdAt: new Date().toISOString(),
    trackerToken: token
  };

  applications.push(applicationRecord);
  trackerByToken.set(token, {
    job,
    applicant: {
      name,
      email
    },
    statusHistory
  });
};

seedApplication({
  name: 'Aisha Bloom',
  email: 'aisha@candidate.com',
  jobId: 'job-software-remote',
  statusIndex: 2,
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  workAuth: 'Work permit'
});

seedApplication({
  name: 'Diego Rivera',
  email: 'diego@candidate.com',
  jobId: 'job-customer-success',
  statusIndex: 1,
  videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  textResponse:
    'I would open by acknowledging the delay, apologise sincerely, and let them know I am on it while offering an immediate make-good.',
  workAuth: 'Citizen'
});

seedApplication({
  name: 'Morgan Lee',
  email: 'morgan@candidate.com',
  jobId: 'job-driver',
  statusIndex: 0,
  videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  workAuth: 'Work permit'
});

export const MockDB = {
  insertApplication: ({
    jobId,
    name,
    email,
    age,
    workAuth,
    consent,
    consentAt,
    consentIp,
    mode,
    videoUrl,
    textResponse,
    trackerToken
  }) => {
    const job = getJobById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const token = trackerToken || generateTrackerToken();
    const record = {
      id: token,
      jobId,
      name,
      email,
      age,
      workAuth,
      consent,
      consentAt: consentAt ?? new Date().toISOString(),
      consentIp: consentIp ?? '127.0.0.1',
      mode,
      videoUrl,
      textResponse,
      status: STATUS_FLOW[0],
      createdAt: new Date().toISOString(),
      trackerToken: token
    };
    applications.push(record);
    trackerByToken.set(token, {
      job,
      applicant: {
        name,
        email
      },
      statusHistory: [buildStatusEntry('Application Delivered', 'Confirmation email sent')]
    });
    return record;
  },

  updateStatus: (token, status, note = '', hrEmail = 'hr@oasis.com') => {
    if (!trackerByToken.has(token)) return null;
    const tracker = trackerByToken.get(token);
    tracker.statusHistory.push(buildStatusEntry(status, note));
    trackerByToken.set(token, tracker);
    const application = applications.find((item) => item.trackerToken === token);
    if (application) {
      application.status = status;
      application.updatedBy = hrEmail;
    }
    return tracker;
  },

  getTracker: (token) => trackerByToken.get(token),

  listApplicants: () =>
    applications.map((record) => {
      const job = getJobById(record.jobId);
      return {
        id: record.trackerToken,
        name: record.name,
        email: record.email,
        jobTitle: job?.title ?? 'Open role',
        workAuth: record.workAuth,
        status: record.status,
        appliedAt: record.createdAt,
        videoUrl:
          record.videoUrl ??
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        textResponse: record.textResponse,
        tags: job?.tags ?? []
      };
    }),

  getJobs: () => JOBS.slice()
};
