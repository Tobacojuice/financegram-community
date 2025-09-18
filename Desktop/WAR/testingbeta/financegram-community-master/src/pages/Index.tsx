import { FormEvent, useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import TerminalDashboard from '../components/TerminalDashboard';
import { Button } from '../components/ui/button';
import { useSessionContext } from '../context/session';

function IndexPage() {
  const { session } = useSessionContext();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
      <section className="space-y-4 text-sm text-terminal-green/60">
        <p className="text-xs uppercase tracking-[0.45em] text-terminal-green/70">Financegram Community Terminal</p>
        <h1 className="text-4xl text-terminal-green sm:text-5xl">
          Bloomberg-grade intelligence, streamed from the Financegram cloud.
        </h1>
        <p className="max-w-3xl text-sm text-terminal-green/60">
          Connect to the live Financegram platform to access consolidated market data, verified newsroom coverage, real-time hiring flow, and credential tracks built for deal teams. Sessions are backed by our first-party infrastructure—no third-party auth layers required.
        </p>
        <div className="grid gap-2 text-xs uppercase tracking-[0.3em] text-terminal-green/45 sm:grid-cols-2">
          <span>Markets - Financegram market core with intraday analytics</span>
          <span>Newswire - Curated enterprise headlines routed through Financegram</span>
          <span>JobSea - Daily hiring tape from our talent exchange</span>
          <span>Communities - Moderated desk chatter and sentiment telemetry</span>
        </div>
      </section>

      {session ? <TerminalDashboard /> : <LoginSection />}
    </div>
  );
}

function LoginSection() {
  const {
    loginWithEmail,
    loginWithLinkedInDemo,
    loginFormRef,
    emailInputRef,
    isAuthenticating,
    authError,
    clearAuthError,
  } = useSessionContext();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    const isValidEmail = /\S+@\S+\.\S+/.test(trimmed);

    if (!isValidEmail) {
      setError('Enter a valid email address to continue.');
      return;
    }

    setError('');
    await loginWithEmail({ email: trimmed, displayName });
  };

  const handleEmailChange = (next: string) => {
    setEmail(next);
    if (error) {
      setError('');
    }
    if (authError) {
      clearAuthError();
    }
  };

  const handleNameChange = (next: string) => {
    setDisplayName(next);
    if (authError) {
      clearAuthError();
    }
  };

  return (
    <section className="grid gap-8 rounded-2xl border border-terminal-green/30 bg-black/70 p-8 backdrop-blur-sm lg:grid-cols-[1.2fr,1fr]">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.35em] text-terminal-green">
            <span>FG</span>
            <span className="text-xs text-terminal-green/60">Secure cloud access</span>
          </div>
          <p className="text-sm text-terminal-green/60">
            Authenticate against Financegram directly. We issue first-party session cookies—no Supabase, Vercel, or external identity brokers in the loop.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-terminal-green/55">
          <li className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-terminal-green" />
            Transport-security enforced on every request with in-house monitoring.
          </li>
          <li className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-terminal-green" />
            Display name is optional and only used for session personalization.
          </li>
        </ul>
      </div>

      <form
        ref={loginFormRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-terminal-green/30 bg-black/60 p-6 shadow-[0_0_35px_rgba(74,255,128,0.15)]"
      >
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-terminal-green/50">Display Name</label>
          <input
            value={displayName}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="Optional"
            className="mt-1 w-full rounded-md border border-terminal-green/30 bg-black/50 px-4 py-3 text-sm text-terminal-green placeholder:text-terminal-green/40 focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green"
            type="text"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-terminal-green/50">Email</label>
          <input
            ref={emailInputRef}
            value={email}
            onChange={(event) => handleEmailChange(event.target.value)}
            placeholder="ilopez-mele@alumni.unav.es"
            className="mt-1 w-full rounded-md border border-terminal-green/30 bg-black/50 px-4 py-3 text-sm text-terminal-green placeholder:text-terminal-green/40 focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green"
            type="email"
            autoComplete="email"
            required
          />
          {error && <p className="mt-2 text-xs font-medium text-rose-400">{error}</p>}
          {!error && authError ? (
            <p className="mt-2 text-xs font-medium text-rose-400">{authError}</p>
          ) : null}
        </div>
        <Button
          type="submit"
          className="w-full bg-terminal-green text-black hover:bg-terminal-green/80"
          disabled={isAuthenticating}
        >
          {isAuthenticating ? 'Connecting...' : 'Continue with Email'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full border border-terminal-green/30 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20"
          onClick={() => {
            clearAuthError();
            void loginWithLinkedInDemo();
          }}
          disabled={isAuthenticating}
        >
          Launch LinkedIn Demo Session
        </Button>
        <p className="text-xs text-terminal-green/45">
          Sessions are persisted server-side. Sign out from the header at any point to revoke access instantly.
        </p>
      </form>
    </section>
  );
}

export default IndexPage;

