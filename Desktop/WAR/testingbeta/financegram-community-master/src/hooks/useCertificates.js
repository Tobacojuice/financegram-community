import { useEffect, useState } from 'react';
import { fetchCertificates } from '@/lib/api';
export function useCertificates() {
    const [state, setState] = useState({ programs: [], isLoading: true });
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
            try {
                const payload = await fetchCertificates();
                if (cancelled) {
                    return;
                }
                setState({
                    programs: payload.programs ?? [],
                    isLoading: false,
                    error: undefined,
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
                    error: error instanceof Error ? error.message : 'Unable to fetch certificate programs.',
                }));
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, []);
    return state;
}
