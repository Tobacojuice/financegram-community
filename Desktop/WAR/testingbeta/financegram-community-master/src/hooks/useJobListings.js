import { useEffect, useState } from 'react';
import { fetchJobListings } from '@/lib/api';
const FALLBACK_JOBS = [
    {
        id: 'fg-strat-001',
        title: 'Strategy Analyst - Macro Desk',
        company: 'Financegram',
        location: 'Madrid, ES',
        url: 'https://financegram.community/jobs/strategy-analyst',
        remote: true,
        tags: ['Macro', 'Analytics', 'Python'],
        postedAt: new Date().toISOString(),
    },
    {
        id: 'fg-data-009',
        title: 'Data Pipeline Engineer - Markets',
        company: 'Financegram',
        location: 'New York, US',
        url: 'https://financegram.community/jobs/data-pipeline-engineer',
        remote: false,
        tags: ['ETL', 'TypeScript', 'Kafka'],
        postedAt: new Date().toISOString(),
    },
];
export function useJobListings() {
    const [state, setState] = useState({ listings: [], isLoading: true });
    useEffect(() => {
        let cancelled = false;
        let intervalId;
        const load = async () => {
            setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
            try {
                const payload = await fetchJobListings();
                if (cancelled) {
                    return;
                }
                setState({
                    listings: payload.listings ?? FALLBACK_JOBS,
                    isLoading: false,
                    error: undefined,
                    lastUpdated: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
                });
            }
            catch (error) {
                if (cancelled) {
                    return;
                }
                setState({
                    listings: FALLBACK_JOBS,
                    isLoading: false,
                    error: error instanceof Error ? `${error.message} (displaying cached roles)` : 'Unable to load hiring feed. Displaying cached roles.',
                    lastUpdated: new Date(),
                });
            }
        };
        void load();
        intervalId = window.setInterval(load, 300000);
        return () => {
            cancelled = true;
            if (intervalId) {
                window.clearInterval(intervalId);
            }
        };
    }, []);
    return state;
}
