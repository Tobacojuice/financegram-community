import { useEffect, useState } from 'react';
import { fetchCommunityHighlights, type CommunityHighlight } from '@/lib/api';

const FALLBACK_POSTS: CommunityHighlight[] = [
  {
    id: 'fg-emea-1',
    title: 'European credit desks prep for ECB minutes',
    forum: 'fg-emea',
    forumLabel: 'Financegram · EMEA Forum',
    author: 'emea_credit_lead',
    url: 'https://financegram.community/community/emea-credit-desks',
    score: 512,
    comments: 48,
    createdAt: new Date().toISOString(),
    thumbnail: undefined,
  },
  {
    id: 'fg-usa-1',
    title: 'US equities morning call - growth rotation watch',
    forum: 'fg-usa',
    forumLabel: 'Financegram · USA Forum',
    author: 'ny_equities',
    url: 'https://financegram.community/community/us-equities-morning',
    score: 389,
    comments: 32,
    createdAt: new Date().toISOString(),
    thumbnail: undefined,
  },
  {
    id: 'fg-asia-1',
    title: 'Asia macro rundown - JPY vols spike into policy review',
    forum: 'fg-asia',
    forumLabel: 'Financegram · Asia Forum',
    author: 'tokyo_macro',
    url: 'https://financegram.community/community/asia-macro-rundown',
    score: 274,
    comments: 21,
    createdAt: new Date().toISOString(),
    thumbnail: undefined,
  },
  {
    id: 'fg-uni-navarra',
    title: 'University of Navarra alumni: internship trading playbook',
    forum: 'fg-uni-navarra',
    forumLabel: 'Financegram · University of Navarra Forum',
    author: 'navarra_alumni',
    url: 'https://financegram.community/community/unav-alumni-trading',
    score: 198,
    comments: 18,
    createdAt: new Date().toISOString(),
    thumbnail: undefined,
  },
];

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
          posts: payload.posts?.length ? payload.posts : FALLBACK_POSTS,
          isLoading: false,
          error: undefined,
          lastUpdated: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        setState({
          posts: FALLBACK_POSTS,
          isLoading: false,
          error:
            error instanceof Error
              ? `${error.message} (live community stream offline)`
              : 'Unable to load community activity. Showing cached chatter.',
          lastUpdated: new Date(),
        });
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
