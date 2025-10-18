import { useCallback, useEffect, useMemo, useState } from 'react';
import { JOBS as STATIC_JOBS } from '../data/jobs.js';
import { supabase } from './supabaseClient.js';

const DEFAULT_FILTERS = {
  query: '',
  spot: '',
  timeline: '',
  announced: '',
  tenure: '',
  domain: '',
  role: '',
  niche: ''
};

const normalize = (value) => value?.toString().trim().toLowerCase() ?? '';

const matchesQuery = (job, filters) => {
  const query = normalize(filters.query);
  if (!query) return true;
  const haystack = [
    job.title,
    job.company,
    job.location,
    job.snapshot,
    ...(job.keywords ?? [])
  ]
    .join(' ')
    .toLowerCase();
  return query.split(/\s+/).every((bit) => haystack.includes(bit));
};

const matchesSpot = (job, filters) => {
  const spot = normalize(filters.spot);
  if (!spot) return true;
  return (
    normalize(job.location).includes(spot) ||
    (job.trendingRegions ?? []).some((region) => region.includes(spot))
  );
};

const matchesTimeline = (job, filters) => {
  if (!filters.timeline) return true;
  return job.timeline.toLowerCase().includes(filters.timeline.toLowerCase());
};

const matchesAnnounced = (job, filters) => {
  if (!filters.announced) return true;
  return job.postedAgo?.toLowerCase() === filters.announced.toLowerCase();
};

const matchesTenure = (job, filters) => {
  if (!filters.tenure) return true;
  return (job.tenure ?? 0) >= Number(filters.tenure);
};

const matchesDomain = (job, filters) => {
  if (!filters.domain) return true;
  return job.domain?.toLowerCase() === filters.domain.toLowerCase();
};

const matchesRole = (job, filters) => {
  if (!filters.role) return true;
  return job.role?.toLowerCase().includes(filters.role.toLowerCase());
};

const matchesNiche = (job, filters) => {
  if (!filters.niche) return true;
  const niche = normalize(filters.niche);
  return (job.niche ?? []).some((tag) => tag.toLowerCase().includes(niche));
};

const filterJobs = (jobsList, filters) =>
  jobsList.filter(
    (job) =>
      matchesQuery(job, filters) &&
      matchesSpot(job, filters) &&
      matchesTimeline(job, filters) &&
      matchesAnnounced(job, filters) &&
      matchesTenure(job, filters) &&
      matchesDomain(job, filters) &&
      matchesRole(job, filters) &&
      matchesNiche(job, filters)
  );

const trendingFallback = (jobsList, filters) => {
  const spot = normalize(filters.spot);
  const domain = normalize(filters.domain);
  const role = normalize(filters.role);

  const scored = jobsList.map((job) => {
    let score = 0;
    if (spot && (job.trendingRegions ?? []).some((region) => region.includes(spot))) score += 3;
    if (domain && job.domain?.toLowerCase() === domain) score += 2;
    if (role && job.role?.toLowerCase().includes(role)) score += 2;
    if (!spot && !domain && !role) score += 1;
    if ((job.postedAgo ?? '').toLowerCase().includes('last')) score += 1;
    return { job, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.job);
};

const mapJobRecord = (record) => {
  const fallback =
    STATIC_JOBS.find(
      (job) =>
        job.id === record.id ||
        (record.slug && job.slug === record.slug) ||
        (record.title && job.title === record.title && job.company === record.company)
    ) ?? {};

  const normalizedTags = Array.isArray(record.tags)
    ? record.tags
    : typeof record.tags === 'string'
    ? record.tags.split(',').map((tag) => tag.trim())
    : fallback.tags ?? [];

  const fallbackId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Date.now().toString(36);

  const slug = record.slug ?? fallback.slug ?? record.id ?? fallback.id ?? '';

  return {
    ...fallback,
    ...record,
    id: record.id ?? fallback.id ?? record.slug ?? fallbackId,
    slug,
    company: record.company ?? fallback.company ?? '',
    location: record.location ?? fallback.location ?? '',
    timeline: record.timeline ?? fallback.timeline ?? record.employment_type ?? '',
    snapshot: record.snapshot ?? fallback.snapshot ?? record.description ?? '',
    prompt: {
      title: record.prompt_title ?? fallback.prompt?.title ?? '',
      body: record.prompt_body ?? fallback.prompt?.body ?? ''
    },
    iconKey: record.icon_key ?? record.iconKey ?? fallback.iconKey ?? 'technology',
    tags: normalizedTags,
    keywords: record.keywords ?? fallback.keywords ?? [],
    trendingRegions: record.trending_regions ?? fallback.trendingRegions ?? [],
    postedAgo: record.posted_ago ?? fallback.postedAgo ?? 'Trending',
    tenure: record.tenure ?? fallback.tenure ?? 0
  };
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const resolveJobId = async (job) => {
  if (!supabase) {
    throw new Error('Application service is unavailable.');
  }

  if (UUID_REGEX.test(job.id)) {
    return job.id;
  }

  const slug = job.slug ?? job.id ?? '';
  let identifier = null;

  if (slug) {
    const { data, error } = await supabase
      .from('jobs')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!error && data?.id) {
      return data.id;
    }
    identifier = slug;
  }

  if (job.title && job.company) {
    const { data, error } = await supabase
      .from('jobs')
      .select('id')
      .eq('title', job.title)
      .eq('company', job.company)
      .limit(1)
      .maybeSingle();

    if (!error && data?.id) {
      return data.id;
    }
  }

  throw new Error(
    `This job is no longer accepting applications${identifier ? ` (${identifier})` : ''}.`
  );
};

export const useJobBoardData = () => {
  const [jobsSource, setJobsSource] = useState(STATIC_JOBS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [openJobId, setOpenJobId] = useState(() => STATIC_JOBS[0]?.id ?? null);
  const [applyState, setApplyState] = useState({});

  const filteredJobs = useMemo(
    () => filterJobs(jobsSource, filters),
    [jobsSource, filters]
  );

  const jobs =
    filteredJobs.length > 0 ? filteredJobs : trendingFallback(jobsSource, filters);

  useEffect(() => {
    setIsLoading(true);
    const handle = setTimeout(() => setIsLoading(false), 320);
    return () => clearTimeout(handle);
  }, [filters]);

  useEffect(() => {
    if (openJobId && !jobs.some((job) => job.id === openJobId)) {
      setOpenJobId(jobs[0]?.id ?? null);
    }
  }, [jobs, openJobId]);

  useEffect(() => {
    if (!supabase) return;
    let isActive = true;

    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(
          'id, slug, title, company, domain, role, location, snapshot, description, prompt_title, prompt_body, icon_key, tags, keywords, trending_regions, posted_ago, timeline, tenure, status, created_at'
        )
        .not('status', 'eq', 'archived')
        .order('created_at', { ascending: false });

      if (!isActive) return;

      if (error) {
        console.error('[Jobs] Supabase fetch failed', error);
        return;
      }

      if (data && data.length > 0) {
        const mapped = data.map(mapJobRecord);
        setJobsSource(mapped);
      }
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 1000 * 60 * 5);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, []);

  const setFilter = useCallback((key, value) => {
    if (key === 'reset') {
      setFilters(DEFAULT_FILTERS);
      return;
    }
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const applyToJob = useCallback(async (job, payload) => {
    setApplyState((prev) => ({
      ...prev,
      [job.id]: { status: 'loading' }
    }));

    try {
      const trackerToken = payload.trackerToken;
      const timestamp = new Date().toISOString();
      const jobId = await resolveJobId(job);

      let storagePath = null;
      if (payload.mode !== 'text') {
        const extension =
          payload.videoFile?.name.split('.').pop() ||
          (payload.videoBlob?.type === 'video/mp4'
            ? 'mp4'
            : payload.videoBlob?.type?.split('/').pop() ?? 'webm');
        const fileId = `${trackerToken}-${Date.now()}`;
        const path = `videos/${fileId}.${extension}`;
        const fileToUpload =
          payload.videoFile ??
          (payload.videoBlob
            ? typeof File !== 'undefined'
              ? new File([payload.videoBlob], `${fileId}.${extension}`, {
                  type: payload.videoBlob.type ?? 'video/webm'
                })
              : payload.videoBlob
            : null);

        if (!fileToUpload) {
          throw new Error('No video file provided.');
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(path, fileToUpload, {
            contentType: fileToUpload.type ?? 'video/webm',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        storagePath = uploadData?.path ?? path;
      }

      const insertPayload = {
        job_id: jobId,
        name: payload.name,
        email: payload.email,
        age: payload.age ? Number(payload.age) : null,
        work_auth: payload.workAuth,
        consent: payload.consent,
        consent_at: timestamp,
        consent_ip: 'client-ip-pending',
        tracker_token: trackerToken,
        status: 'Application Delivered',
        submission_mode: payload.mode,
        video_url: storagePath,
        text_response: payload.textResponse ?? ''
      };

      if (payload.resumeFile) {
        const resumeId = `${trackerToken}-${Date.now()}`;
        const resumePath = `resumes/${resumeId}.${payload.resumeFile.name.split('.').pop()}`;
        const { data: resumeData, error: resumeError } = await supabase.storage
          .from('resumes')
          .upload(resumePath, payload.resumeFile, {
            upsert: true,
            contentType: payload.resumeFile.type || 'application/octet-stream'
          });

        if (resumeError) {
          throw resumeError;
        }

        insertPayload.resume_url = resumeData?.path ?? resumePath;
      }

      const { error: insertError } = await supabase
        .from('applications')
        .insert(insertPayload, { returning: 'minimal' });

      if (insertError) {
        throw insertError;
      }

      const zapierHook = import.meta.env.VITE_ZAPIER_NEW_APP;
      if (zapierHook) {
        fetch(zapierHook, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(insertPayload)
        }).catch((error) => console.error('[Zapier] Failed to notify', error));
      }

      setApplyState((prev) => ({
        ...prev,
        [job.id]: {
          status: 'success',
          message:
            'Your application was submitted. Check your email within the next 5 minutes for confirmation.',
          trackerToken
        }
      }));
      return { success: true, trackerToken };
    } catch (error) {
      setApplyState((prev) => ({
        ...prev,
        [job.id]: {
          status: 'error',
          message: error.message ?? 'Something went wrong. Please try again.'
        }
      }));
      return { success: false };
    }
  }, []);

  return {
    filters,
    setFilter,
    jobs,
    isLoading,
    openJobId,
    setOpenJobId,
    applyState,
    applyToJob
  };
};
