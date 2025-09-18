import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import IndexPage from './pages/Index';
import { SessionContext, type Session, type CommunityMembership } from './context/session';
import {
  fetchSession,
  signInWithEmail,
  signInWithLinkedInDemo,
  signOut,
  type ApiSession,
} from './lib/api';
import { buildCommunityMemberships } from './lib/community';

const DEFAULT_DEMO_EMAIL = 'demo@linkedin.com';

function deriveNameFromEmail(email: string) {
  const [localPart] = email.split('@');
  if (!localPart) {
    return 'Financegram Member';
  }
  return localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

type SessionLike = Pick<ApiSession, 'name' | 'email' | 'provider'> & {
  communities?: CommunityMembership[];
};

function normalizeSession(apiSession: SessionLike, fallbackEmail?: string): Session {
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
  const [session, setSession] = useState<Session | null>(null);
  const [isBootstrappingSession, setIsBootstrappingSession] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const loginFormRef = useRef<HTMLFormElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const bootstrap = useCallback(async () => {
    setIsBootstrappingSession(true);
    try {
      const payload = await fetchSession();
      setSession(payload.session ? normalizeSession(payload.session) : null);
    } catch (error) {
      console.warn('Unable to hydrate session from API, continuing unauthenticated.', error);
      setSession(null);
    } finally {
      setIsBootstrappingSession(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const loginWithEmail = useCallback(
    async ({ email, displayName }: { email: string; displayName?: string }) => {
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
      } catch (error) {
        console.warn('Email auth failed, enabling local preview session.', error);
        setSession(
          normalizeSession(
            {
              name: derivedName,
              email: trimmedEmail,
              provider: 'email',
            },
            trimmedEmail,
          ),
        );
        setAuthError(
          error instanceof Error
            ? `${error.message} (running in local preview mode)`
            : 'Authentication failed - switched to local preview session.',
        );
      } finally {
        setIsAuthenticating(false);
      }
    },
    [],
  );

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
    } catch (error) {
      console.warn('Demo session api unavailable, falling back to bundled demo.', error);
      setSession(
        normalizeSession(
          {
            name: 'LinkedIn Demo',
            email: DEFAULT_DEMO_EMAIL,
            provider: 'linkedin-demo',
          },
          DEFAULT_DEMO_EMAIL,
        ),
      );
      setAuthError(
        error instanceof Error
          ? `${error.message} (bundled demo session active)`
          : 'Unable to launch demo session - loaded bundled demo instead.',
      );
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.warn('Sign out failed, clearing local session anyway.', error);
    } finally {
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

  const sessionValue = useMemo(
    () => ({
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
    }),
    [
      session,
      loginWithEmail,
      loginWithLinkedInDemo,
      logout,
      showLogin,
      isAuthenticating,
      authError,
      clearAuthError,
    ],
  );

  if (isBootstrappingSession) {
    return (
      <div className="grid min-h-screen place-items-center bg-black text-xs uppercase tracking-[0.3em] text-terminal-green/50">
        Connecting to Financegram...
      </div>
    );
  }

  return (
    <SessionContext.Provider value={sessionValue}>
      <div className="min-h-screen bg-black text-terminal-green/80 font-terminal tracking-[0.12em]">
        <div className="relative flex min-h-screen flex-col bg-terminal-grid bg-terminal-pattern">
          <div className="pointer-events-none absolute inset-0 bg-black/85" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#14391b_0,rgba(0,0,0,0)_60%)] opacity-80" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0d2f2f_0,rgba(0,0,0,0)_60%)] opacity-70" />
          <Header />
          <main className="relative z-10 flex-1 overflow-y-auto">
            <IndexPage />
          </main>
        </div>
      </div>
    </SessionContext.Provider>
  );
}

export default App;
