import { createContext, useContext } from 'react';
export const SessionContext = createContext(null);
export function useSessionContext() {
    const ctx = useContext(SessionContext);
    if (!ctx) {
        throw new Error('useSessionContext must be used within a SessionContext provider');
    }
    return ctx;
}
