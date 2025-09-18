import type { CommunityMembership, ProviderId } from '@/context/session';

const DEFAULT_API_BASE = 'https://api.financegram.community';

function resolveBaseUrl() {
  const fromEnv = import.meta.env.VITE_FINANCEGRAM_API_BASE;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim().replace(/\/$/, '');
  }
  return DEFAULT_API_BASE;
}

export const API_BASE_URL = resolveBaseUrl();

interface RequestOptions extends RequestInit {
  skipJson?: boolean;
}

async function request<TResponse>(path: string, options: RequestOptions = {}) {
  const { skipJson, headers, ...rest } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) {
        message = body.error;
      }
    } catch (error) {
      // Ignore JSON parse failures and retain default message.
    }
    throw new Error(message);
  }

  if (skipJson || response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export interface ApiSession {
  name: string;
  email: string;
  provider: ProviderId;
  communities?: CommunityMembership[];
}

export interface SessionResponse {
  session: ApiSession | null;
}

export async function fetchSession() {
  return request<SessionResponse>('/api/session');
}

export async function signInWithEmail(payload: { email: string; name?: string }) {
  return request<SessionResponse>('/api/auth/email', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signInWithLinkedInDemo() {
  return request<SessionResponse>('/api/auth/demo', {
    method: 'POST',
  });
}

export async function signOut() {
  await request('/api/auth/logout', { method: 'POST', skipJson: true });
}

export interface MarketQuote {
  symbol: string;
  label: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  volume?: number;
}

export interface MarketSeriesPoint {
  timestamp: string;
  value: number;
}

export interface MarketDataResponse {
  quotes: MarketQuote[];
  series: MarketSeriesPoint[];
  updatedAt?: string;
}

export async function fetchMarketData() {
  return request<MarketDataResponse>('/api/markets/snapshot');
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  description?: string;
  imageUrl?: string;
  publishedAt?: string;
}

export interface NewsResponse {
  items: NewsItem[];
  source: string;
  updatedAt?: string;
}

export async function fetchNews() {
  return request<NewsResponse>('/api/news/headlines');
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  remote: boolean;
  tags?: string[];
  postedAt?: string;
}

export interface JobListingsResponse {
  listings: JobListing[];
  updatedAt?: string;
}

export async function fetchJobListings() {
  return request<JobListingsResponse>('/api/talent/jobsea');
}

export interface CommunityHighlight {
  id: string;
  title: string;
  forum: string;
  forumLabel: string;
  author: string;
  url: string;
  score: number;
  comments: number;
  createdAt?: string;
  thumbnail?: string;
}

export interface CommunityResponse {
  posts: CommunityHighlight[];
  updatedAt?: string;
}

export async function fetchCommunityHighlights() {
  return request<CommunityResponse>('/api/communities/highlights');
}

export interface CertificateProgram {
  id: string;
  title: string;
  provider: string;
  duration: string;
  format: string;
  costRange: string;
  description: string;
  url: string;
  imageUrl?: string;
}

export interface CertificatesResponse {
  programs: CertificateProgram[];
  updatedAt?: string;
}

export async function fetchCertificates() {
  return request<CertificatesResponse>('/api/learning/certifications');
}
