import { useEffect, useMemo, useState } from 'react';
import { UploadCloud, Video, Loader2, Smartphone, FileText } from 'lucide-react';
import useRecorder from '../lib/useRecorder.js';
import { generateTrackerToken } from '../lib/tokens.js';

const WORK_AUTH_OPTIONS = ['Citizen', 'Work permit', 'No documents'];

const MODE = {
  RECORD: 'record',
  UPLOAD: 'upload',
  TEXT: 'text'
};

const ApplyPanel = ({ job, onApply, applyState = { status: 'idle' } }) => {
  const { recording, blob: recordedBlob, start, stop, reset, videoRef } = useRecorder();
  const [supportsRecorder, setSupportsRecorder] = useState(true);
  const [mode, setMode] = useState(MODE.RECORD);
  const [uploadFile, setUploadFile] = useState(null);
  const [textFallback, setTextFallback] = useState('');
  const [mobileLink, setMobileLink] = useState('');
  const [trackerLink, setTrackerLink] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    workAuth: '',
    consent: false
  });
  const [recordingError, setRecordingError] = useState('');

  useEffect(() => {
    if (applyState.status === 'success') {
      setResumeFile(null);
      setUploadFile(null);
      setTextFallback('');
    }
  }, [applyState.status]);

  useEffect(() => {
    const isSupported =
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function';
    setSupportsRecorder(isSupported);
    setMode(isSupported ? MODE.RECORD : MODE.UPLOAD);
    if (!isSupported) {
      setRecordingError(
        'Your device does not support in-browser recording. You can try to upload or write a quick response instead.'
      );
    }
  }, []);

  useEffect(() => {
    if (mode === MODE.RECORD) {
      setUploadFile(null);
      setTextFallback('');
    }
    if (mode === MODE.UPLOAD) {
      stop();
      reset();
      setTextFallback('');
    }
    if (mode === MODE.TEXT) {
      stop();
      reset();
      setUploadFile(null);
      setResumeFile(null);
    }
    if (mode !== MODE.RECORD) {
      setRecordingError('');
    }
  }, [mode, reset, stop]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canSubmit = useMemo(() => {
    if (!form.name || !form.email || !form.age || !form.workAuth || !form.consent) {
      return false;
    }
    if (mode === MODE.RECORD) {
      return !!recordedBlob;
    }
    if (mode === MODE.UPLOAD) {
      return !!uploadFile;
    }
    if (mode === MODE.TEXT) {
      return textFallback.trim().length > 20;
    }
    return false;
  }, [form, mode, recordedBlob, uploadFile, textFallback]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || applyState.status === 'loading') return;
    setTrackerLink('');
    await onApply(job, {
      ...form,
      mode,
      videoBlob: mode === MODE.RECORD ? recordedBlob : null,
      videoFile: mode === MODE.UPLOAD ? uploadFile : null,
      textResponse: mode === MODE.TEXT ? textFallback.trim() : '',
      resumeFile,
      trackerToken: generateTrackerToken()
    });
  };

  const handleGenerateMobileLink = () => {
    const token = generateTrackerToken();
    const fallbackUrl = `https://oasis.com/apply?job=${job.id}&handoff=${token}`;
    setMobileLink(fallbackUrl);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fallbackUrl).catch(() => undefined);
    }
  };

  const handleStartRecording = async () => {
    try {
      setRecordingError('');
      await start();
    } catch (error) {
      console.error('Recorder start failed', error);
      setRecordingError(
        'We could not access your camera or microphone. Recommendation: enable permissions or upload a file instead.'
      );
      setSupportsRecorder(false);
      setMode(MODE.UPLOAD);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 px-6 pb-6 pt-2 text-sm text-zinc-200">
      <div className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wide text-zinc-500">Work authorization</label>
          <select
            value={form.workAuth}
            onChange={(event) => handleInputChange('workAuth', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-sm text-white focus:border-oasis-primary focus:outline-none focus:ring-2 focus:ring-oasis-primary/40"
          >
            <option value="">Select option</option>
            {WORK_AUTH_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-zinc-500">Age</label>
          <input
            type="number"
            value={form.age}
            onChange={(event) => handleInputChange('age', event.target.value)}
            placeholder="e.g. 29"
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-sm text-white focus:border-oasis-primary focus:outline-none focus:ring-2 focus:ring-oasis-primary/40"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-zinc-500">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(event) => handleInputChange('name', event.target.value)}
            placeholder="Your full name"
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-sm text-white focus:border-oasis-primary focus:outline-none focus:ring-2 focus:ring-oasis-primary/40"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-zinc-500">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => handleInputChange('email', event.target.value)}
            placeholder="Any email that HR should reach you at"
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-sm text-white focus:border-oasis-primary focus:outline-none focus:ring-2 focus:ring-oasis-primary/40"
          />
        </div>
      </div>

      <section className="rounded-3xl border border-oasis-primary/40 bg-oasis-primary/5 p-5">
        <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-oasis-primary">Prompt</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-white">{job.prompt.title}</h3>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
            <span>• 30 seconds max</span>
            <span>• One take should be sufficient</span>
            <span>• Personal tone</span>
          </div>
        </header>
        <p className="mt-4 rounded-2xl border border-oasis-primary/20 bg-zinc-950/60 p-4 text-sm text-zinc-200">
          {job.prompt.body}
        </p>
        <p className="mt-2 text-xs text-oasis-primary">
          You can now record a short video answering the prompt in each job posting. Every video is reviewed by the hiring team, giving you a unique chance to stand out from other applicants.
        </p>
      </section>

      <section className="grid gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">
              You can record or upload a quick video (up to 30 sec)
            </h3>
            <p className="text-xs text-zinc-400">
              Text responses are equally valid.
That said, in a competitive pool, video responses may increase your chances of standing out.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {supportsRecorder && (
              <button
                type="button"
                onClick={() => setMode(MODE.RECORD)}
                className={`rounded-full border px-3 py-1 ${
                  mode === MODE.RECORD
                    ? 'border-oasis-primary bg-oasis-primary/10 text-oasis-primary'
                    : 'border-zinc-700 text-zinc-300'
                }`}
              >
                <Video className="mr-1 inline h-3 w-3" />
                In-app record
              </button>
            )}
            <button
              type="button"
              onClick={() => setMode(MODE.UPLOAD)}
              className={`rounded-full border px-3 py-1 ${
                mode === MODE.UPLOAD
                  ? 'border-oasis-primary bg-oasis-primary/10 text-oasis-primary'
                  : 'border-zinc-700 text-zinc-300'
              }`}
            >
              <UploadCloud className="mr-1 inline h-3 w-3" />
              Upload video
            </button>
            <button
              type="button"
              onClick={() => setMode(MODE.TEXT)}
              className={`rounded-full border px-3 py-1 ${
                mode === MODE.TEXT
                  ? 'border-oasis-primary bg-oasis-primary/10 text-oasis-primary'
                  : 'border-zinc-700 text-zinc-300'
              }`}
            >
              <FileText className="mr-1 inline h-3 w-3" />
              Text response
            </button>
          </div>
        </header>

        {!supportsRecorder && (
          <div className="rounded-2xl border border-orange-500/40 bg-orange-500/10 p-4 text-xs text-orange-200">
            Your browser doesn&apos;t support live recording. We recommend uploading a short 30s clip or sharing a text
            response instead.
          </div>
        )}

        {mode === MODE.RECORD && (
          <div className="grid gap-3 rounded-2xl border border-zinc-800 bg-black/40 p-4 text-center">
            <video
              className="aspect-video w-full rounded-xl border border-zinc-800 bg-black object-cover"
              autoPlay
              muted
              playsInline
          ref={videoRef}
            />
            <div className="flex items-center justify-center gap-3">
              {!recording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="rounded-full bg-oasis-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-oasis-primary/80"
                >
                  Start recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stop}
                  className="rounded-full border border-red-500/60 px-4 py-2 text-sm font-semibold text-red-400 transition hover:border-red-400 hover:text-white"
                >
                  Stop
                </button>
              )}
              {recordedBlob && (
                <p className="text-xs text-zinc-400">
                  Recorded clip ready ({Math.round(recordedBlob.size / 1024)} KB)
                </p>
              )}
            </div>
            {recordingError && (
              <p className="text-xs text-red-400">{recordingError}</p>
            )}
          </div>
        )}

        {mode === MODE.UPLOAD && (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/80 p-6 text-center">
            <UploadCloud className="h-10 w-10 text-oasis-primary" />
            <div>
              <p className="text-sm font-semibold text-white">Drop a video or click to upload</p>
              <p className="text-xs text-zinc-500">Max 25 MB · MP4 or WebM · 30s max</p>
            </div>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
            />
            {uploadFile && (
              <p className="text-xs text-oasis-primary">
                Selected: {uploadFile.name} ({Math.round(uploadFile.size / 1024)} KB)
              </p>
            )}
          </label>
        )}

        {mode === MODE.TEXT && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <textarea
              value={textFallback}
              onChange={(event) => setTextFallback(event.target.value)}
              rows={5}
              placeholder="Describe briefly (2–3 sentences) how you’d respond to the prompt."
              className="w-full rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-white focus:border-oasis-primary focus:outline-none focus:ring-2 focus:ring-oasis-primary/40"
            />
            <p className="mt-2 text-xs text-zinc-500">
              We recommend at least 2 sentences so hiring team can understand your approach.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <h3 className="font-semibold text-white">Resume / portfolio</h3>
          <p className="text-xs text-zinc-500">Attach one supporting document (PDF, DOCX, TXT · max 5&nbsp;MB).</p>
          <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/80 p-6 text-center">
            <UploadCloud className="h-8 w-8 text-zinc-400" />
            <span className="text-sm text-zinc-300">Drop file here or click to upload</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
            />
            {resumeFile && (
              <p className="text-xs text-oasis-primary">
                {resumeFile.name} ({Math.round(resumeFile.size / 1024)} KB)
              </p>
            )}
          </label>
        </div>

      </section>

      <label className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-xs text-zinc-300">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(event) => handleInputChange('consent', event.target.checked)}
          className="mt-1 h-4 w-4 rounded border border-zinc-700 bg-black text-oasis-primary focus:ring-oasis-primary/40"
        />
        <span>
          I consent to Oasis storing and reviewing my submitted information — including video, text,
          name, and email — to evaluate me for this role. I understand I can request deletion anytime.{' '}
          <a href="/privacy" className="text-oasis-primary underline-offset-2 hover:underline">
            Privacy policy
          </a>
          .
        </span>
      </label>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-zinc-500">
          Response typically takes within 24–48 hours. A confirmation email arrives within minutes of submission.
        </div>
        <button
          type="submit"
          disabled={!canSubmit || applyState.status === 'loading'}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-oasis-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-oasis-primary/80 disabled:cursor-not-allowed disabled:bg-zinc-700"
        >
          {applyState.status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
          Enter Consideration
        </button>
      </div>

      {applyState.status === 'success' && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <p>{applyState.message ?? 'Application submitted. Check your email for confirmation.'}</p>
          {applyState.trackerToken && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-emerald-300">Track status anytime:</span>
              <button
                type="button"
                onClick={() => {
                  const trackerUrl = `${window.location.origin}/tracker?token=${applyState.trackerToken}`;
                  navigator.clipboard?.writeText(trackerUrl).catch(() => undefined);
                  setTrackerLink(trackerUrl);
                }}
                className="rounded-full border border-emerald-400/50 px-3 py-1 font-semibold text-emerald-200 transition hover:border-emerald-300 hover:text-white"
              >
                Copy tracker link
              </button>
              {trackerLink && (
                <span className="text-emerald-200">{trackerLink}</span>
              )}
            </div>
          )}
        </div>
      )}
      {applyState.status === 'error' && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {applyState.message ?? 'We could not send your application. Try again or contact support.'}
        </div>
      )}
    </form>
  );
};

export default ApplyPanel;
