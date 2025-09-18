import { useEffect, useState } from 'react';
import { fetchNews } from '@/lib/api';
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
                    items: payload.items ?? [],
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
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Unable to refresh headlines.',
                }));
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
