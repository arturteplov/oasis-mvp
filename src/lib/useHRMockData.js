import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabaseClient.js';

const STATUS_NOTES = {
  'Under Review': 'reviewing',
  'Interview stage': 'interview',
  'Outcome pending': 'shortlist',
  "Doesn’t meet criteria": 'decline',
  "Pending applicant decision": 'offer',
  'Invitation to Join': 'offer',
  Archive: 'archived'
};

export const useHRMockData = () => {
  const [applicants, setApplicants] = useState([]);

  const refresh = useCallback(() => {
    if (!supabase) {
      setApplicants([]);
      return;
    }

    const fetchApplicants = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(
          `
            id,
            tracker_token,
            job_id,
            name,
            email,
            work_auth,
            status,
            created_at,
            video_url,
            text_response,
            resume_url,
            jobs (
              title,
              company,
              tags,
              prompt_title,
              prompt_body
            )
          `
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[HR] Failed to load applicants', error);
        setApplicants([]);
        return;
      }

      const resolved = await Promise.all(
        (data ?? []).map(async (record) => {
          let signedVideoUrl = null;
          if (record.video_url) {
            const { data: signed, error: signedError } = await supabase.storage
              .from('videos')
              .createSignedUrl(record.video_url, 60 * 60);
            if (signedError) {
              console.error('[HR] Failed to sign video URL', signedError);
            } else {
              signedVideoUrl = signed?.signedUrl ?? null;
            }
          }

          let signedResumeUrl = null;
          if (record.resume_url) {
            const { data: resumeSigned, error: resumeError } = await supabase.storage
              .from('resumes')
              .createSignedUrl(record.resume_url, 60 * 60);
            if (resumeError) {
              console.error('[HR] Failed to sign resume URL', resumeError);
            } else {
              signedResumeUrl = resumeSigned?.signedUrl ?? null;
            }
          }

          const tags = Array.isArray(record.jobs?.tags)
            ? record.jobs?.tags
            : typeof record.jobs?.tags === 'string'
            ? record.jobs?.tags.split(',').map((tag) => tag.trim())
            : [];

          return {
            id: record.tracker_token,
            applicationId: record.id,
            trackerToken: record.tracker_token,
            jobId: record.job_id,
            name: record.name,
            email: record.email,
            jobTitle: record.jobs?.title ?? 'Open role',
            jobCompany: record.jobs?.company ?? '',
            workAuth: record.work_auth,
            status: record.status,
            appliedAt: record.created_at,
            videoUrl: signedVideoUrl,
            textResponse: record.text_response,
            tags,
            jobPromptTitle: record.jobs?.prompt_title ?? '',
            jobPromptBody: record.jobs?.prompt_body ?? '',
            resumeUrl: signedResumeUrl
          };
        })
      );

      setApplicants(resolved);
    };

    fetchApplicants();
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateStatus = useCallback(
    async (trackerToken, status, options = {}) => {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('tracker_token', trackerToken)
        .select('id')
        .maybeSingle();

      if (error) {
        console.error('[HR] Failed to update status', error);
        return;
      }

      let note = options.noteOverride ?? STATUS_NOTES[status] ?? '';
      if (data?.id) {
        const { error: actionError } = await supabase.from('actions').insert({
          application_id: data.id,
          action_type: status,
          note,
          hr_email: 'hr@oasis.com'
        });
        if (actionError) {
          console.error('[HR] Failed to log action', actionError);
        }
        setApplicants((prev) =>
          prev
            .map((record) =>
              record.trackerToken === trackerToken
                ? { ...record, status, latestNote: note }
                : record
            )
        );
      }

      const statusHook =
        import.meta.env.VITE_ZAPIER_STATUS_UPDATE ?? import.meta.env.VITE_ZAPIER_STATUS_CHANGE;
      if (statusHook) {
        fetch(statusHook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackerToken, status })
        }).catch((error) => console.error('[Zapier] Status hook failed', error));
      }

      refresh();
    },
    [refresh]
  );

  return {
    applicants,
    updateStatus
  };
};
