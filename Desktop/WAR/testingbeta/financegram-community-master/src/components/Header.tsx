import { Linkedin, LogOut, Mail, Server, Wifi } from 'lucide-react';
import { Button } from './ui/button';
import { useSessionContext } from '../context/session';
import { SUPABASE_URL } from '@/lib/supabaseClient';

function deriveHostLabel(url: string) {
  try {
    return new URL(url).host;
  } catch (error) {
    return url.replace(/^https?:\/\//, '');
  }
}

const apiHostLabel = SUPABASE_URL ? deriveHostLabel(SUPABASE_URL) : "supabase not configured";

function Header() {
  const { session, showLogin, loginWithLinkedInDemo, logout, isAuthenticating } = useSessionContext();
  const connectionLabel = session ? 'Authenticated' : 'Guest access';

  return (
    <header className="relative z-20 border-b border-terminal-green/30 bg-black/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-terminal-green">
            FG
            <span className="text-xs tracking-[0.3em] text-terminal-green/60">Community Terminal</span>
          </div>
          <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-terminal-green/45">
            <Server className="h-3 w-3" /> {apiHostLabel}
            <span className="flex items-center gap-1">
              <Wifi className={`h-3 w-3 ${session ? 'text-terminal-green' : 'text-terminal-green/30'}`} />
              {connectionLabel}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-terminal-green">{session.name}</div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-terminal-green/45">
                  {session.provider === 'linkedin-demo' ? 'LinkedIn demo session' : session.email}
                </div>
              </div>
              <Button
                variant="ghost"
                className="border border-terminal-green/30 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20"
                onClick={() => {
                  void logout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="border border-terminal-green/30 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20"
                onClick={showLogin}
                disabled={isAuthenticating}
              >
                <Mail className="mr-2 h-4 w-4" /> Email Login
              </Button>
              <Button
                className="bg-terminal-green text-black hover:bg-terminal-green/80"
                onClick={() => {
                  void loginWithLinkedInDemo();
                }}
                disabled={isAuthenticating}
              >
                <Linkedin className="mr-2 h-4 w-4" /> LinkedIn Demo
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

