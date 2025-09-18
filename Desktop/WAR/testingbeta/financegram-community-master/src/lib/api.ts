import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import type { CommunityMembership, ProviderId } from '@/context/session';
import { buildCommunityMemberships } from './community';
import { getFirestoreDb, FIREBASE_PROJECT_ID } from './firebaseClient';

const LOCAL_SESSION_KEY = 'financegram.local.session';

export interface ApiSession {
  name: string;
  email: string;
  provider: ProviderId;
  communities: CommunityMembership[];
}

export interface SessionResponse {
  session: ApiSession | null;
}

function persistSession(session: ApiSession | null) {
  if (typeof window === 'undefined') {
    return;
  }
  if (!session) {
    window.localStorage.removeItem(LOCAL_SESSION_KEY);
    return;
  }
  window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
}

function loadSession(): ApiSession | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.localStorage.getItem(LOCAL_SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as ApiSession;
    if (parsed?.email && parsed?.name) {
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to parse stored session, clearing.', error);
  }
  window.localStorage.removeItem(LOCAL_SESSION_KEY);
  return null;
}

export async function fetchSession(): Promise<SessionResponse> {
  return { session: loadSession() };
}

export async function signInWithEmail(payload: { email: string; name?: string }): Promise<SessionResponse> {
  const trimmedEmail = payload.email.trim().toLowerCase();
  const name = (payload.name ?? '').trim() || trimmedEmail;
  const communities = buildCommunityMemberships(trimmedEmail);
  const session: ApiSession = {
    name,
    email: trimmedEmail,
    provider: 'email',
    communities,
  };
  persistSession(session);
  return { session };
}

export async function signInWithLinkedInDemo(): Promise<SessionResponse> {
  const email = 'demo@linkedin.com';
  const session: ApiSession = {
    name: 'LinkedIn Demo',
    email,
    provider: 'linkedin-demo',
    communities: buildCommunityMemberships(email),
  };
  persistSession(session);
  return { session };
}

export async function signOut(): Promise<void> {
  persistSession(null);
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

export async function fetchMarketData(): Promise<MarketDataResponse> {
  const db = getFirestoreDb();
  try {
    const quotesSnap = await getDocs(
      query(collection(db, 'market_quotes'), orderBy('updated_at', 'desc'), limit(50)),
    );
    const seriesSnap = await getDocs(
      query(collection(db, 'market_series'), orderBy('timestamp', 'asc'), limit(500)),
    );

    const quotes: MarketQuote[] = quotesSnap.docs.map((doc) => {
      const data = doc.data() ?? {};
      return {
        symbol: data.symbol ?? doc.id,
        label: data.label ?? data.symbol ?? doc.id,
        price: Number(data.price ?? 0),
        change: Number(data.change ?? 0),
        changePercent: Number(data.change_percent ?? 0),
        previousClose: Number(data.previous_close ?? 0),
        volume: data.volume ? Number(data.volume) : undefined,
      };
    });

    const series: MarketSeriesPoint[] = seriesSnap.docs.map((doc) => {
      const data = doc.data() ?? {};
      return {
        timestamp: data.timestamp ?? '',
        value: Number(data.value ?? 0),
      };
    });

    return {
      quotes,
      series,
      updatedAt: quotesSnap.docs[0]?.data()?.updated_at,
    };
  } catch (error) {
    console.warn('Unable to fetch market data from Firebase.', error);
    throw error;
  }
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

export async function fetchNews(): Promise<NewsResponse> {
  const db = getFirestoreDb();
  try {
    const snap = await getDocs(
      query(collection(db, 'news_items'), orderBy('published_at', 'desc'), limit(50)),
    );
    const items: NewsItem[] = snap.docs.map((doc) => {
      const data = doc.data() ?? {};
      return {
        id: doc.id,
        title: data.title ?? 'Untitled',
        source: data.source ?? 'Financegram',
        url: data.url ?? '#',
        description: data.description ?? undefined,
        imageUrl: data.image_url ?? undefined,
        publishedAt: data.published_at ?? undefined,
      };
    });

    return {
      items,
      source: 'Firebase newsroom',
      updatedAt: snap.docs[0]?.data()?.updated_at,
    };
  } catch (error) {
    console.warn('Unable to fetch news from Firebase.', error);
    throw error;
  }
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

export async function fetchJobListings(): Promise<JobListingsResponse> {
  const db = getFirestoreDb();
  try {
    const snap = await getDocs(
      query(collection(db, 'talent_jobs'), orderBy('posted_at', 'desc'), limit(50)),
    );

    const listings: JobListing[] = snap.docs.map((doc) => {
      const data = doc.data() ?? {};
      return {
        id: doc.id,
        title: data.title ?? 'Role',
        company: data.company ?? 'Financegram Client',
        location: data.location ?? 'Global',
        url: data.url ?? '#',
        remote: Boolean(data.remote),
        tags: Array.isArray(data.tags) ? data.tags : undefined,
        postedAt: data.posted_at ?? undefined,
      };
    });

    return {
      listings,
      updatedAt: snap.docs[0]?.data()?.updated_at,
    };
  } catch (error) {
    console.warn('Unable to fetch job listings from Firebase.', error);
    throw error;
  }
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

export async function fetchCommunityHighlights(): Promise<CommunityResponse> {
  const db = getFirestoreDb();
  try {
    const snap = await getDocs(
      query(collection(db, 'community_posts'), orderBy('created_at', 'desc'), limit(50)),
    );

    const posts: CommunityHighlight[] = snap.docs.map((doc) => {
      const data = doc.data() ?? {};
      return {
        id: doc.id,
        title: data.title ?? 'Thread',
        forum: data.forum ?? 'fg-global',
        forumLabel: data.forum_label ?? 'Financegram - Global Forum',
        author: data.author ?? 'financegram',
        url: data.url ?? '#',
        score: Number(data.score ?? 0),
        comments: Number(data.comments ?? 0),
        createdAt: data.created_at ?? undefined,
        thumbnail: data.thumbnail ?? undefined,
      };
    });

    return {
      posts,
      updatedAt: snap.docs[0]?.data()?.updated_at,
    };
  } catch (error) {
    console.warn('Unable to fetch community posts from Firebase.', error);
    throw error;
  }
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

export async function fetchCertificates(): Promise<CertificatesResponse> {
  const db = getFirestoreDb();
  try {
    const snap = await getDocs(query(collection(db, 'learning_certifications'), orderBy('title', 'asc')));

    const programs: CertificateProgram[] = snap.docs.map((doc) => {
      const data = doc.data() ?? {};
      return {
        id: doc.id,
        title: data.title ?? 'Certification',
        provider: data.provider ?? 'Financegram Academy',
        duration: data.duration ?? 'Self-paced',
        format: data.format ?? 'On-demand',
        costRange: data.cost_range ?? 'N/A',
        description: data.description ?? '',
        url: data.url ?? '#',
        imageUrl: data.image_url ?? undefined,
      };
    });

    return {
      programs,
      updatedAt: snap.docs[0]?.data()?.updated_at,
    };
  } catch (error) {
    console.warn('Unable to fetch certifications from Firebase.', error);
    throw error;
  }
}
