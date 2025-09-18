import { useEffect, useState } from 'react';
import { fetchCommunityHighlights, type CommunityHighlight } from '@/lib/api';

interface CommunityState {
  posts: CommunityHighlight[];
  isLoading: boolean;
  error?: string;
  lastUpdated?: Date;
}

export function useCommunities() {
  const [state, setState] = useState<CommunityState>({ posts: [], isLoading: true });

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;

    const load = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
      try {
        const payload = await fetchCommunityHighlights();
        if (cancelled) {
          return;
        }
        setState({
          posts: payload.posts ?? [],
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
          error: error instanceof Error ? error.message : 'Unable to fetch community radar.',
        }));
      }
    };

    void load();
    intervalId = window.setInterval(load, 180_000);

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  return state;
}
