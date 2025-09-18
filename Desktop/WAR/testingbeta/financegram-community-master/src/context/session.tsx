import { createContext, useContext, type RefObject } from 'react';

export type ProviderId = 'email' | 'linkedin-demo';

export interface CommunityMembership {
  id: string;
  label: string;
}

export interface Session {
  name: string;
  email: string;
  provider: ProviderId;
  communities: CommunityMembership[];
}

export interface SessionContextValue {
  session: Session | null;
  loginWithEmail: (payload: { email: string; displayName?: string }) => Promise<void> | void;
  loginWithLinkedInDemo: () => Promise<void> | void;
  logout: () => Promise<void> | void;
  showLogin: () => void;
  loginFormRef: RefObject<HTMLFormElement>;
  emailInputRef: RefObject<HTMLInputElement>;
  isAuthenticating: boolean;
  authError: string | null;
  clearAuthError: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSessionContext() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSessionContext must be used within a SessionContext provider');
  }
  return ctx;
}
