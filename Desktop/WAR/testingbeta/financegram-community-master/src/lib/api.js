import { buildCommunityMemberships } from './community';
import { supabase } from './supabaseClient';
function ensureSupabase() {
    if (!supabase) {
        throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    return supabase;
}
async function fetchProfileCommunities(userId, email) {
    if (!supabase || !userId) {
        return buildCommunityMemberships(email ?? '');
    }
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('communities')
            .eq('id', userId)
            .maybeSingle();
        if (error) {
            throw error;
        }
        const raw = Array.isArray(data?.communities) ? data?.communities : [];
        const normalized = raw.filter((entry) => entry?.id && entry?.label);
        return buildCommunityMemberships(email ?? '', normalized);
    }
    catch (error) {
        console.warn('Unable to fetch profile communities from Supabase.', error);
        return buildCommunityMemberships(email ?? '');
    }
}
async function mapSupabaseSession(session) {
    if (!session?.user) {
        return null;
    }
    const email = session.user.email ?? '';
    const provider = session.user.app_metadata?.provider ?? 'email';
    const name = session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        email;
    const communities = await fetchProfileCommunities(session.user.id, email);
    return {
        name,
        email,
        provider,
        communities,
    };
}
export async function fetchSession() {
    const client = ensureSupabase();
    const { data, error } = await client.auth.getSession();
    if (error) {
        throw new Error(error.message);
    }
    return { session: await mapSupabaseSession(data.session) };
}
export async function signInWithEmail(payload) {
    const client = ensureSupabase();
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await client.auth.signInWithOtp({
        email: payload.email,
        options: {
            data: payload.name ? { full_name: payload.name } : undefined,
            emailRedirectTo: redirectTo,
        },
    });
    if (error) {
        throw new Error(error.message);
    }
    const { data, error: sessionError } = await client.auth.getSession();
    if (sessionError) {
        throw new Error(sessionError.message);
    }
    return { session: await mapSupabaseSession(data.session) };
}
export async function signInWithLinkedInDemo() {
    const client = ensureSupabase();
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { data, error } = await client.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
            redirectTo,
        },
    });
    if (error) {
        throw new Error(error.message);
    }
    if (data?.url && typeof window !== 'undefined') {
        window.location.href = data.url;
    }
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) {
        throw new Error(sessionError.message);
    }
    return { session: await mapSupabaseSession(sessionData.session) };
}
export async function signOut() {
    const client = ensureSupabase();
    const { error } = await client.auth.signOut();
    if (error) {
        throw new Error(error.message);
    }
}
export async function fetchMarketData() {
    const client = ensureSupabase();
    const [{ data: quotesData, error: quotesError }, { data: seriesData, error: seriesError }] = await Promise.all([
        client
            .from('market_quotes')
            .select('symbol,label,price,change,change_percent,previous_close,volume,updated_at')
            .order('updated_at', { ascending: false }),
        client
            .from('market_series')
            .select('timestamp,value')
            .order('timestamp', { ascending: true }),
    ]);
    if (quotesError) {
        throw new Error(quotesError.message);
    }
    if (seriesError) {
        throw new Error(seriesError.message);
    }
    const quotes = (quotesData ?? []).map((row) => ({
        symbol: row.symbol,
        label: row.label,
        price: Number(row.price ?? 0),
        change: Number(row.change ?? 0),
        changePercent: Number(row.change_percent ?? 0),
        previousClose: Number(row.previous_close ?? 0),
        volume: row.volume ? Number(row.volume) : undefined,
    }));
    const series = (seriesData ?? []).map((row) => ({
        timestamp: row.timestamp,
        value: Number(row.value ?? 0),
    }));
    return {
        quotes,
        series,
        updatedAt: quotesData?.[0]?.updated_at ?? undefined,
    };
}
export async function fetchNews() {
    const client = ensureSupabase();
    const { data, error } = await client
        .from('news_items')
        .select('id,title,source,url,description,image_url,published_at,updated_at')
        .order('published_at', { ascending: false })
        .limit(50);
    if (error) {
        throw new Error(error.message);
    }
    const items = (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        source: row.source,
        url: row.url,
        description: row.description ?? undefined,
        imageUrl: row.image_url ?? undefined,
        publishedAt: row.published_at ?? undefined,
    }));
    return {
        items,
        source: 'Supabase newsroom',
        updatedAt: data?.[0]?.updated_at ?? undefined,
    };
}
export async function fetchJobListings() {
    const client = ensureSupabase();
    const { data, error } = await client
        .from('talent_jobs')
        .select('id,title,company,location,url,remote,tags,posted_at,updated_at')
        .order('posted_at', { ascending: false })
        .limit(50);
    if (error) {
        throw new Error(error.message);
    }
    const listings = (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        company: row.company,
        location: row.location,
        url: row.url,
        remote: Boolean(row.remote),
        tags: Array.isArray(row.tags) ? row.tags : undefined,
        postedAt: row.posted_at ?? undefined,
    }));
    return {
        listings,
        updatedAt: data?.[0]?.updated_at ?? undefined,
    };
}
export async function fetchCommunityHighlights() {
    const client = ensureSupabase();
    const { data, error } = await client
        .from('community_posts')
        .select('id,title,forum,forum_label,author,url,score,comments,created_at,thumbnail,updated_at')
        .order('created_at', { ascending: false })
        .limit(50);
    if (error) {
        throw new Error(error.message);
    }
    const posts = (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        forum: row.forum,
        forumLabel: row.forum_label,
        author: row.author,
        url: row.url,
        score: Number(row.score ?? 0),
        comments: Number(row.comments ?? 0),
        createdAt: row.created_at ?? undefined,
        thumbnail: row.thumbnail ?? undefined,
    }));
    return {
        posts,
        updatedAt: data?.[0]?.updated_at ?? undefined,
    };
}
export async function fetchCertificates() {
    const client = ensureSupabase();
    const { data, error } = await client
        .from('learning_certifications')
        .select('id,title,provider,duration,format,cost_range,description,url,image_url,updated_at')
        .order('title', { ascending: true });
    if (error) {
        throw new Error(error.message);
    }
    const programs = (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        provider: row.provider,
        duration: row.duration,
        format: row.format,
        costRange: row.cost_range,
        description: row.description,
        url: row.url,
        imageUrl: row.image_url ?? undefined,
    }));
    return {
        programs,
        updatedAt: data?.[0]?.updated_at ?? undefined,
    };
}
