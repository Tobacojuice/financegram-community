import { useEffect, useMemo, useState } from 'react';
import { fetchMarketData } from '@/lib/api';
const FALLBACK_QUOTES = [
    { symbol: 'SPY', label: 'S&P 500 ETF', price: 543.02, change: 2.34, changePercent: 0.43, previousClose: 540.68 },
    { symbol: 'QQQ', label: 'Nasdaq 100 ETF', price: 473.55, change: 3.1, changePercent: 0.66, previousClose: 470.45 },
    { symbol: 'DIA', label: 'Dow Jones ETF', price: 392.1, change: -0.9, changePercent: -0.23, previousClose: 393 },
];
const FALLBACK_SERIES = [
    { timestamp: '2025-09-18T13:30:00Z', value: 540 },
    { timestamp: '2025-09-18T14:00:00Z', value: 541.5 },
    { timestamp: '2025-09-18T14:30:00Z', value: 542.2 },
    { timestamp: '2025-09-18T15:00:00Z', value: 541.1 },
    { timestamp: '2025-09-18T15:30:00Z', value: 543.02 },
];
export function useMarketData() {
    const [state, setState] = useState({
        quotes: [],
        series: [],
        isLoading: true,
    });
    useEffect(() => {
        let cancelled = false;
        let intervalId;
        const load = async () => {
            setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
            try {
                const payload = await fetchMarketData();
                if (cancelled) {
                    return;
                }
                setState({
                    quotes: payload.quotes ?? FALLBACK_QUOTES,
                    series: payload.series ?? FALLBACK_SERIES,
                    lastUpdated: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
                    isLoading: false,
                    error: undefined,
                });
            }
            catch (error) {
                if (cancelled) {
                    return;
                }
                setState({
                    quotes: FALLBACK_QUOTES,
                    series: FALLBACK_SERIES,
                    lastUpdated: new Date(),
                    isLoading: false,
                    error: error instanceof Error ? `${error.message} (showing cached snapshot)` : 'Unable to sync market data. Showing cached snapshot.',
                });
            }
        };
        void load();
        intervalId = window.setInterval(load, 60000);
        return () => {
            cancelled = true;
            if (intervalId) {
                window.clearInterval(intervalId);
            }
        };
    }, []);
    const performanceSummary = useMemo(() => {
        if (!state.quotes.length) {
            return null;
        }
        const sorted = [...state.quotes].sort((a, b) => b.changePercent - a.changePercent);
        return {
            leaders: sorted.slice(0, 2),
            laggards: sorted.slice(-2).reverse(),
        };
    }, [state.quotes]);
    return {
        ...state,
        performanceSummary,
    };
}
