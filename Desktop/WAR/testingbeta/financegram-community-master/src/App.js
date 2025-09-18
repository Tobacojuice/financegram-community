import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import IndexPage from './pages/Index';
import { SessionContext } from './context/session';
import { fetchSession, signInWithEmail, signInWithLinkedInDemo, signOut, } from './lib/api';
const DEFAULT_DEMO_EMAIL = 'demo@linkedin.com';
const REGION_LABELS = {
    'fg-emea': 'Financegram � EMEA Forum',
    'fg-usa': 'Financegram � USA Forum',
    'fg-asia': 'Financegram � Asia Forum',
};
const GLOBAL_FORUM = {
    id: 'fg-global',
    label: 'Financegram � Global Forum',
};
const UNIVERSITY_FORUMS = {
    'alumni.unav.es': {
        id: 'fg-uni-navarra',
        label: 'Financegram � University of Navarra Forum',
        region: 'fg-emea',
    },
    'unav.es': {
        id: 'fg-uni-navarra',
        label: 'Financegram � University of Navarra Forum',
        region: 'fg-emea',
    },
};
const TLD_REGION_MAP = {
    es: 'fg-emea',
    fr: 'fg-emea',
    uk: 'fg-emea',
    de: 'fg-emea',
    it: 'fg-emea',
    pt: 'fg-emea',
    ie: 'fg-emea',
    eu: 'fg-emea',
    edu: 'fg-usa',
    us: 'fg-usa',
    ca: 'fg-usa',
    mx: 'fg-usa',
    jp: 'fg-asia',
    sg: 'fg-asia',
    cn: 'fg-asia',
    hk: 'fg-asia',
    au: 'fg-asia',
    in: 'fg-asia',
};
function deriveNameFromEmail(email) {
    const [localPart] = email.split('@');
    if (!localPart) {
        return 'Financegram Member';
    }
    return localPart
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
function uniqueMemberships(entries) {
    const seen = new Set();
    const ordered = [];
    for (const entry of entries) {
        if (!seen.has(entry.id)) {
            seen.add(entry.id);
            ordered.push(entry);
        }
    }
    return ordered;
}
function determineRegionByEmail(email) {
    const domain = email.split('@')[1] ?? '';
    const parts = domain.split('.');
    const tld = parts.length > 0 ? parts[parts.length - 1].toLowerCase() : '';
    return TLD_REGION_MAP[tld] ?? 'fg-emea';
}
function buildCommunityMemberships(email, existing) {
    const lowerEmail = email.trim().toLowerCase();
    if (!lowerEmail) {
        return existing?.length ? existing : [GLOBAL_FORUM];
    }
    const domain = lowerEmail.split('@')[1] ?? '';
    const universityEntry = UNIVERSITY_FORUMS[domain];
    const region = universityEntry?.region ?? determineRegionByEmail(lowerEmail);
    const memberships = [GLOBAL_FORUM, { id: region, label: REGION_LABELS[region] }];
    if (universityEntry) {
        memberships.push({ id: universityEntry.id, label: universityEntry.label });
    }
    if (existing?.length) {
        memberships.push(...existing);
    }
    return uniqueMemberships(memberships);
}
function normalizeSession(apiSession, fallbackEmail) {
    const resolvedEmail = (apiSession.email || fallbackEmail || '').trim().toLowerCase();
    const communities = buildCommunityMemberships(resolvedEmail || fallbackEmail || '', apiSession.communities);
    return {
        name: apiSession.name,
        email: resolvedEmail,
        provider: apiSession.provider,
        communities,
    };
}
function App() {
    const [session, setSession] = useState(null);
    const [isBootstrappingSession, setIsBootstrappingSession] = useState(true);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authError, setAuthError] = useState(null);
    const loginFormRef = useRef(null);
    const emailInputRef = useRef(null);
    const bootstrap = useCallback(async () => {
        setIsBootstrappingSession(true);
        try {
            const payload = await fetchSession();
            setSession(payload.session ? normalizeSession(payload.session) : null);
        }
        catch (error) {
            console.warn('Unable to hydrate session from API, continuing unauthenticated.', error);
            setSession(null);
        }
        finally {
            setIsBootstrappingSession(false);
        }
    }, []);
    useEffect(() => {
        void bootstrap();
    }, [bootstrap]);
    const loginWithEmail = useCallback(async ({ email, displayName }) => {
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail) {
            return;
        }
        const derivedName = displayName?.trim() || deriveNameFromEmail(trimmedEmail);
        setIsAuthenticating(true);
        setAuthError(null);
        try {
            const payload = await signInWithEmail({ email: trimmedEmail, name: derivedName });
            if (!payload.session) {
                setAuthError('Unable to start your Financegram session. Please try again.');
                return;
            }
            setSession(normalizeSession(payload.session));
        }
        catch (error) {
            console.warn('Email auth failed, enabling local preview session.', error);
            setSession(normalizeSession({
                name: derivedName,
                email: trimmedEmail,
                provider: 'email',
            }, trimmedEmail));
            setAuthError(error instanceof Error
                ? `${error.message} (running in local preview mode)`
                : 'Authentication failed - switched to local preview session.');
        }
        finally {
            setIsAuthenticating(false);
        }
    }, []);
    const loginWithLinkedInDemo = useCallback(async () => {
        setIsAuthenticating(true);
        setAuthError(null);
        try {
            const payload = await signInWithLinkedInDemo();
            if (!payload.session) {
                setAuthError('Demo session is currently unavailable.');
                return;
            }
            setSession(normalizeSession(payload.session));
        }
        catch (error) {
            console.warn('Demo session api unavailable, falling back to bundled demo.', error);
            setSession(normalizeSession({
                name: 'LinkedIn Demo',
                email: DEFAULT_DEMO_EMAIL,
                provider: 'linkedin-demo',
            }, DEFAULT_DEMO_EMAIL));
            setAuthError(error instanceof Error
                ? `${error.message} (bundled demo session active)`
                : 'Unable to launch demo session - loaded bundled demo instead.');
        }
        finally {
            setIsAuthenticating(false);
        }
    }, []);
    const logout = useCallback(async () => {
        try {
            await signOut();
        }
        catch (error) {
            console.warn('Sign out failed, clearing local session anyway.', error);
        }
        finally {
            setSession(null);
        }
    }, []);
    const showLogin = useCallback(() => {
        if (!loginFormRef.current) {
            return;
        }
        loginFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        requestAnimationFrame(() => {
            emailInputRef.current?.focus({ preventScroll: true });
            emailInputRef.current?.select();
        });
    }, []);
    const clearAuthError = useCallback(() => setAuthError(null), []);
    const sessionValue = useMemo(() => ({
        session,
        loginWithEmail,
        loginWithLinkedInDemo,
        logout,
        showLogin,
        loginFormRef,
        emailInputRef,
        isAuthenticating,
        authError,
        clearAuthError,
    }), [
        session,
        loginWithEmail,
        loginWithLinkedInDemo,
        logout,
        showLogin,
        isAuthenticating,
        authError,
        clearAuthError,
    ]);
    if (isBootstrappingSession) {
        return (_jsx("div", { className: "grid min-h-screen place-items-center bg-black text-xs uppercase tracking-[0.3em] text-terminal-green/50", children: "Connecting to Financegram..." }));
    }
    return (_jsx(SessionContext.Provider, { value: sessionValue, children: _jsx("div", { className: "min-h-screen bg-black text-terminal-green/80 font-terminal tracking-[0.12em]", children: _jsxs("div", { className: "relative flex min-h-screen flex-col bg-terminal-grid bg-terminal-pattern", children: [_jsx("div", { className: "pointer-events-none absolute inset-0 bg-black/85" }), _jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#14391b_0,rgba(0,0,0,0)_60%)] opacity-80" }), _jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0d2f2f_0,rgba(0,0,0,0)_60%)] opacity-70" }), _jsx(Header, {}), _jsx("main", { className: "relative z-10 flex-1 overflow-y-auto", children: _jsx(IndexPage, {}) })] }) }) }));
}
export default App;
