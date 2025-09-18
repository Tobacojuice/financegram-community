import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import TerminalDashboard from '../components/TerminalDashboard';
import { Button } from '../components/ui/button';
import { useSessionContext } from '../context/session';
function IndexPage() {
    const { session } = useSessionContext();
    return (_jsxs("div", { className: "mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12", children: [_jsxs("section", { className: "space-y-4 text-sm text-terminal-green/60", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.45em] text-terminal-green/70", children: "Financegram Community Terminal" }), _jsx("h1", { className: "text-4xl text-terminal-green sm:text-5xl", children: "Bloomberg-grade intelligence, streamed from the Financegram cloud." }), _jsx("p", { className: "max-w-3xl text-sm text-terminal-green/60", children: "Connect to the live Financegram platform to access consolidated market data, verified newsroom coverage, real-time hiring flow, and credential tracks built for deal teams. Sessions are backed by our first-party infrastructure\uFFFDno third-party auth layers required." }), _jsxs("div", { className: "grid gap-2 text-xs uppercase tracking-[0.3em] text-terminal-green/45 sm:grid-cols-2", children: [_jsx("span", { children: "Markets - Financegram market core with intraday analytics" }), _jsx("span", { children: "Newswire - Curated enterprise headlines routed through Financegram" }), _jsx("span", { children: "JobSea - Daily hiring tape from our talent exchange" }), _jsx("span", { children: "Communities - Moderated desk chatter and sentiment telemetry" })] })] }), session ? _jsx(TerminalDashboard, {}) : _jsx(LoginSection, {})] }));
}
function LoginSection() {
    const { loginWithEmail, loginWithLinkedInDemo, loginFormRef, emailInputRef, isAuthenticating, authError, clearAuthError, } = useSessionContext();
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = async (event) => {
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
    const handleEmailChange = (next) => {
        setEmail(next);
        if (error) {
            setError('');
        }
        if (authError) {
            clearAuthError();
        }
    };
    const handleNameChange = (next) => {
        setDisplayName(next);
        if (authError) {
            clearAuthError();
        }
    };
    return (_jsxs("section", { className: "grid gap-8 rounded-2xl border border-terminal-green/30 bg-black/70 p-8 backdrop-blur-sm lg:grid-cols-[1.2fr,1fr]", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.35em] text-terminal-green", children: [_jsx("span", { children: "FG" }), _jsx("span", { className: "text-xs text-terminal-green/60", children: "Secure cloud access" })] }), _jsx("p", { className: "text-sm text-terminal-green/60", children: "Authenticate against Financegram directly. We issue first-party session cookies\uFFFDno Supabase, Vercel, or external identity brokers in the loop." })] }), _jsxs("ul", { className: "space-y-3 text-sm text-terminal-green/55", children: [_jsxs("li", { className: "flex items-center gap-3", children: [_jsx(ShieldCheck, { className: "h-4 w-4 text-terminal-green" }), "Transport-security enforced on every request with in-house monitoring."] }), _jsxs("li", { className: "flex items-center gap-3", children: [_jsx(Lock, { className: "h-4 w-4 text-terminal-green" }), "Display name is optional and only used for session personalization."] })] })] }), _jsxs("form", { ref: loginFormRef, onSubmit: handleSubmit, className: "flex flex-col gap-4 rounded-xl border border-terminal-green/30 bg-black/60 p-6 shadow-[0_0_35px_rgba(74,255,128,0.15)]", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs uppercase tracking-[0.3em] text-terminal-green/50", children: "Display Name" }), _jsx("input", { value: displayName, onChange: (event) => handleNameChange(event.target.value), placeholder: "Optional", className: "mt-1 w-full rounded-md border border-terminal-green/30 bg-black/50 px-4 py-3 text-sm text-terminal-green placeholder:text-terminal-green/40 focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green", type: "text", autoComplete: "name" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs uppercase tracking-[0.3em] text-terminal-green/50", children: "Email" }), _jsx("input", { ref: emailInputRef, value: email, onChange: (event) => handleEmailChange(event.target.value), placeholder: "ilopez-mele@alumni.unav.es", className: "mt-1 w-full rounded-md border border-terminal-green/30 bg-black/50 px-4 py-3 text-sm text-terminal-green placeholder:text-terminal-green/40 focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green", type: "email", autoComplete: "email", required: true }), error && _jsx("p", { className: "mt-2 text-xs font-medium text-rose-400", children: error }), !error && authError ? (_jsx("p", { className: "mt-2 text-xs font-medium text-rose-400", children: authError })) : null] }), _jsx(Button, { type: "submit", className: "w-full bg-terminal-green text-black hover:bg-terminal-green/80", disabled: isAuthenticating, children: isAuthenticating ? 'Connecting...' : 'Continue with Email' }), _jsx(Button, { type: "button", variant: "ghost", className: "w-full border border-terminal-green/30 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20", onClick: () => {
                            clearAuthError();
                            void loginWithLinkedInDemo();
                        }, disabled: isAuthenticating, children: "Launch LinkedIn Demo Session" }), _jsx("p", { className: "text-xs text-terminal-green/45", children: "Sessions are persisted server-side. Sign out from the header at any point to revoke access instantly." })] })] }));
}
export default IndexPage;
