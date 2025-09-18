import { useEffect, useState } from 'react';
import { fetchJobListings, type JobListing } from '@/lib/api';

interface JobState {
  listings: JobListing[];
  isLoading: boolean;
  error?: string;
  lastUpdated?: Date;
}

export function useJobListings() {
  const [state, setState] = useState<JobState>({ listings: [], isLoading: true });

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;

    const load = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
      try {
        const payload = await fetchJobListings();
        if (cancelled) {
          return;
        }
        setState({
          listings: payload.listings ?? [],
          isLoading: false,
          error: undefined,
          lastUpdated: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unable to load hiring feed.',
        }));
      }
    };

    void load();
    intervalId = window.setInterval(load, 300_000);

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  return state;
}
