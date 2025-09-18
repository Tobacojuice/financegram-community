import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { buildCommunityMemberships } from './community';
import { getFirestoreDb } from './firebaseClient';
const LOCAL_SESSION_KEY = 'financegram.local.session';
function persistSession(session) {
    if (typeof window === 'undefined') {
        return;
    }
    if (!session) {
        window.localStorage.removeItem(LOCAL_SESSION_KEY);
        return;
    }
    window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
}
function loadSession() {
    if (typeof window === 'undefined') {
        return null;
    }
    const raw = window.localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) {
        return null;
    }
    try {
        const parsed = JSON.parse(raw);
        if (parsed?.email && parsed?.name) {
            return parsed;
        }
    }
    catch (error) {
        console.warn('Unable to parse stored session, clearing.', error);
    }
    window.localStorage.removeItem(LOCAL_SESSION_KEY);
    return null;
}
export async function fetchSession() {
    return { session: loadSession() };
}
export async function signInWithEmail(payload) {
    const trimmedEmail = payload.email.trim().toLowerCase();
    const name = (payload.name ?? '').trim() || trimmedEmail;
    const communities = buildCommunityMemberships(trimmedEmail);
    const session = {
        name,
        email: trimmedEmail,
        provider: 'email',
        communities,
    };
    persistSession(session);
    return { session };
}
export async function signInWithLinkedInDemo() {
    const email = 'demo@linkedin.com';
    const session = {
        name: 'LinkedIn Demo',
        email,
        provider: 'linkedin-demo',
        communities: buildCommunityMemberships(email),
    };
    persistSession(session);
    return { session };
}
export async function signOut() {
    persistSession(null);
}
export async function fetchMarketData() {
    const db = getFirestoreDb();
    try {
        const quotesSnap = await getDocs(query(collection(db, 'market_quotes'), orderBy('updated_at', 'desc'), limit(50)));
        const seriesSnap = await getDocs(query(collection(db, 'market_series'), orderBy('timestamp', 'asc'), limit(500)));
        const quotes = quotesSnap.docs.map((doc) => {
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
        const series = seriesSnap.docs.map((doc) => {
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
    }
    catch (error) {
        console.warn('Unable to fetch market data from Firebase.', error);
        throw error;
    }
}
export async function fetchNews() {
    const db = getFirestoreDb();
    try {
        const snap = await getDocs(query(collection(db, 'news_items'), orderBy('published_at', 'desc'), limit(50)));
        const items = snap.docs.map((doc) => {
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
    }
    catch (error) {
        console.warn('Unable to fetch news from Firebase.', error);
        throw error;
    }
}
export async function fetchJobListings() {
    const db = getFirestoreDb();
    try {
        const snap = await getDocs(query(collection(db, 'talent_jobs'), orderBy('posted_at', 'desc'), limit(50)));
        const listings = snap.docs.map((doc) => {
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
    }
    catch (error) {
        console.warn('Unable to fetch job listings from Firebase.', error);
        throw error;
    }
}
export async function fetchCommunityHighlights() {
    const db = getFirestoreDb();
    try {
        const snap = await getDocs(query(collection(db, 'community_posts'), orderBy('created_at', 'desc'), limit(50)));
        const posts = snap.docs.map((doc) => {
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
    }
    catch (error) {
        console.warn('Unable to fetch community posts from Firebase.', error);
        throw error;
    }
}
export async function fetchCertificates() {
    const db = getFirestoreDb();
    try {
        const snap = await getDocs(query(collection(db, 'learning_certifications'), orderBy('title', 'asc')));
        const programs = snap.docs.map((doc) => {
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
    }
    catch (error) {
        console.warn('Unable to fetch certifications from Firebase.', error);
        throw error;
    }
}
