import { useEffect, useState } from 'react';
import { fetchCertificates, type CertificateProgram } from '@/lib/api';

const FALLBACK_CERTIFICATES: CertificateProgram[] = [
  {
    id: 'fg-bmc',
    title: 'Bloomberg Market Concepts (Financegram Edition)',
    provider: 'Financegram Academy',
    duration: '10 hours self-paced',
    format: 'On-demand with terminal workflows',
    costRange: 'Included with Financegram subscription',
    description: 'Immersive primer covering terminal navigation, macro dashboards, credit monitors, and equity screeners.',
    url: 'https://financegram.community/academy/bmc',
    imageUrl: 'https://financegram.community/static/logos/fg-academy.svg',
  },
  {
    id: 'fg-market-strategy',
    title: 'Market Strategy Certification',
    provider: 'Financegram Academy',
    duration: '6 weeks part-time',
    format: 'Live cohorts + recordings',
    costRange: '€1,150',
    description: 'Cross-asset strategy programme with daily terminals drills and risk scenario labs.',
    url: 'https://financegram.community/academy/market-strategy',
    imageUrl: 'https://financegram.community/static/logos/fg-strategy.svg',
  },
];

interface CertificatesState {
  programs: CertificateProgram[];
  isLoading: boolean;
  error?: string;
  lastUpdated?: Date;
}

export function useCertificates() {
  const [state, setState] = useState<CertificatesState>({ programs: [], isLoading: true });

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
          programs: payload.programs ?? FALLBACK_CERTIFICATES,
          isLoading: false,
          error: undefined,
          lastUpdated: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        setState({
          programs: FALLBACK_CERTIFICATES,
          isLoading: false,
          error: error instanceof Error ? `${error.message} (showing cached programmes)` : 'Unable to fetch certificate programs. Showing cached programmes.',
          lastUpdated: new Date(),
        });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
