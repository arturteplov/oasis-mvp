import { useEffect, useRef, useState } from 'react';
import { STATUS_FLOW } from '../data/jobs.js';

export const useTrackerData = (token) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [job, setJob] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
  const prevSnapshotRef = useRef('');

  useEffect(() => {
    if (!token || !supabaseUrl || !supabaseKey) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const fetchTracker = async () => {
      if (!hasFetchedOnce) {
        setIsLoading(true);
      }
      const applicationResponse = await fetch(
        `${supabaseUrl}/rest/v1/applications?select=id,tracker_token,status,text_response,name,email,created_at,updated_at,jobs(id,title,company,location)&tracker_token=eq.${encodeURIComponent(
          token
        )}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Accept: 'application/json',
            'x-tracker-token': token
          }
        }
      );

      if (!isActive) return;

      if (!applicationResponse.ok) {
        if (!hasFetchedOnce) {
          setStatusHistory([]);
          setJob(null);
          setApplicant(null);
        }
        setIsLoading(false);
        return;
      }

      const applications = await applicationResponse.json();
      const application = Array.isArray(applications) ? applications[0] : null;

      if (!application) {
        if (!hasFetchedOnce) {
          setStatusHistory([]);
          setJob(null);
          setApplicant(null);
        }
        setIsLoading(false);
        return;
      }

      setApplicant((prev) => {
        const next = {
          name: application.name,
          email: application.email
        };
        return prev && prev.name === next.name && prev.email === next.email ? prev : next;
      });

      setJob((prev) => {
        const next = {
          id: application.jobs?.id ?? application.job_id,
          title: application.jobs?.title ?? 'Role',
          company: application.jobs?.company ?? '',
          location: application.jobs?.location ?? ''
        };
        return prev &&
          prev.id === next.id &&
          prev.title === next.title &&
          prev.company === next.company &&
          prev.location === next.location
          ? prev
          : next;
      });

      const baseHistory = [
        {
          status: STATUS_FLOW[0],
          note: 'Confirmation email sent',
        timestamp: application.created_at
      }
      ];

      const actionsResponse = await fetch(
        `${supabaseUrl}/rest/v1/actions?select=action_type,note,created_at&application_id=eq.${encodeURIComponent(
          application.id
        )}&order=created_at.asc`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Accept: 'application/json',
            'x-tracker-token': token
          }
        }
      );

      let actions = [];
      if (actionsResponse.ok) {
        actions = await actionsResponse.json();
      } else {
        console.error('[Tracker] Failed to load actions', await actionsResponse.text());
      }

      if (actions.length) {
        baseHistory.push(
          ...actions.map((action) => ({
            status: action.action_type,
            note: action.note,
            timestamp: action.created_at
          }))
        );
      } else if (application.status && application.status !== STATUS_FLOW[0]) {
        baseHistory.push({
          status: application.status,
          note: '',
          timestamp: application.updated_at ?? application.created_at
        });
      }

      const snapshot = JSON.stringify({
        baseHistory,
        applicant: {
          name: application.name,
          email: application.email
        },
        job: {
          id: application.jobs?.id ?? application.job_id,
          title: application.jobs?.title ?? 'Role',
          company: application.jobs?.company ?? '',
          location: application.jobs?.location ?? ''
        }
      });

      if (prevSnapshotRef.current !== snapshot) {
        prevSnapshotRef.current = snapshot;
        setStatusHistory(baseHistory);
      }

      setIsLoading(false);
      setHasFetchedOnce(true);
    };

    fetchTracker();
    const interval = setInterval(fetchTracker, 10000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [token, hasFetchedOnce, supabaseUrl, supabaseKey]);

  return {
    statusHistory,
    job,
    applicant,
    isLoading
  };
};
