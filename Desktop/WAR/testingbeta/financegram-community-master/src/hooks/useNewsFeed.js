import { useEffect, useState } from 'react';
import { fetchNews } from '@/lib/api';
const FALLBACK_NEWS = [
    {
        id: 'fallback-1',
        title: 'Financegram expands global market coverage desk',
        source: 'Financegram Newsroom',
        url: 'https://financegram.community/newsroom/global-market-coverage',
        description: 'New analytics pods add real-time FX, rates, and commodities commentary for cross-asset desks.',
        publishedAt: new Date().toISOString(),
    },
    {
        id: 'fallback-2',
        title: 'Bloomberg terminal workflows mapped into Financegram bundles',
        source: 'Bloomberg Partnership',
        url: 'https://financegram.community/newsroom/bloomberg-integration',
        description: 'Financegram now mirrors terminal monitor layouts, easing analyst migration during earnings season.',
        publishedAt: new Date().toISOString(),
    },
];
export function useNewsFeed() {
    const [state, setState] = useState({
        items: [],
        isLoading: true,
        sourceLabel: 'Financegram newsroom',
    });
    useEffect(() => {
        let cancelled = false;
        let intervalId;
        const load = async () => {
            setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
            try {
                const payload = await fetchNews();
                if (cancelled) {
                    return;
                }
                setState({
                    items: payload.items ?? FALLBACK_NEWS,
                    isLoading: false,
                    error: undefined,
                    sourceLabel: payload.source ?? 'Financegram newsroom',
                    lastUpdated: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
                });
            }
            catch (error) {
                if (cancelled) {
                    return;
                }
                setState({
                    items: FALLBACK_NEWS,
                    isLoading: false,
                    error: error instanceof Error ? `${error.message} (showing cached headlines)` : 'Unable to refresh headlines. Showing cached headlines.',
                    sourceLabel: 'Financegram newsroom (cached)',
                    lastUpdated: new Date(),
                });
            }
        };
        void load();
        intervalId = window.setInterval(load, 180000);
        return () => {
            cancelled = true;
            if (intervalId) {
                window.clearInterval(intervalId);
            }
        };
    }, []);
    return state;
}
