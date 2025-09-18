import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Linkedin, LogOut, Mail, Server, Wifi } from 'lucide-react';
import { Button } from './ui/button';
import { useSessionContext } from '../context/session';
import { FIREBASE_PROJECT_ID } from '@/lib/firebaseClient';
const apiHostLabel = FIREBASE_PROJECT_ID ?? 'firebase not configured';
function Header() {
    const { session, showLogin, loginWithLinkedInDemo, logout, isAuthenticating } = useSessionContext();
    const connectionLabel = session ? 'Authenticated' : 'Guest access';
    return (_jsx("header", { className: "relative z-20 border-b border-terminal-green/30 bg-black/85 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-6", children: [_jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: "flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-terminal-green", children: ["FG", _jsx("span", { className: "text-xs tracking-[0.3em] text-terminal-green/60", children: "Community Terminal" })] }), _jsxs("span", { className: "flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-terminal-green/45", children: [_jsx(Server, { className: "h-3 w-3" }), " ", apiHostLabel, _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Wifi, { className: `h-3 w-3 ${session ? 'text-terminal-green' : 'text-terminal-green/30'}` }), connectionLabel] })] })] }), _jsx("div", { className: "flex items-center gap-4", children: session ? (_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm text-terminal-green", children: session.name }), _jsx("div", { className: "text-[11px] uppercase tracking-[0.3em] text-terminal-green/45", children: session.provider === 'linkedin-demo' ? 'LinkedIn demo session' : session.email })] }), _jsxs(Button, { variant: "ghost", className: "border border-terminal-green/30 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20", onClick: () => {
                                    void logout();
                                }, children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), " Logout"] })] })) : (_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Button, { variant: "ghost", className: "border border-terminal-green/30 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20", onClick: showLogin, disabled: isAuthenticating, children: [_jsx(Mail, { className: "mr-2 h-4 w-4" }), " Email Login"] }), _jsxs(Button, { className: "bg-terminal-green text-black hover:bg-terminal-green/80", onClick: () => {
                                    void loginWithLinkedInDemo();
                                }, disabled: isAuthenticating, children: [_jsx(Linkedin, { className: "mr-2 h-4 w-4" }), " LinkedIn Demo"] })] })) })] }) }));
}
export default Header;
