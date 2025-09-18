import { useEffect, useMemo, useState } from 'react';
import { fetchMarketData, type MarketDataResponse } from '@/lib/api';

interface MarketDataState {
  quotes: MarketDataResponse['quotes'];
  series: MarketDataResponse['series'];
  lastUpdated?: Date;
  isLoading: boolean;
  error?: string;
}

export function useMarketData() {
  const [state, setState] = useState<MarketDataState>({
    quotes: [],
    series: [],
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;

    const load = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
      try {
        const payload = await fetchMarketData();
        if (cancelled) {
          return;
        }
        setState({
          quotes: payload.quotes ?? [],
          series: payload.series ?? [],
          lastUpdated: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
          isLoading: false,
          error: undefined,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unable to sync market data.',
        }));
      }
    };

    void load();
    intervalId = window.setInterval(load, 60_000);

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
