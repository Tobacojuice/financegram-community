import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import IndexPage from './pages/Index';
import { SessionContext } from './context/session';
import { fetchSession, signInWithEmail, signInWithLinkedInDemo, signOut, } from './lib/api';
function deriveNameFromEmail(email) {
    const [localPart] = email.split('@');
    if (!localPart) {
        return 'Financegram Member';
    }
    return localPart
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
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
            setSession(payload.session ?? null);
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
            setSession(payload.session);
        }
        catch (error) {
            setAuthError(error instanceof Error ? error.message : 'Authentication failed.');
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
            setSession(payload.session);
        }
        catch (error) {
            setAuthError(error instanceof Error ? error.message : 'Unable to launch demo session.');
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
