import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, CalendarDays, BookMarked, ClipboardList,
    ClipboardCheck, FolderKanban, Clock, Users, BarChart2,
    LogOut, User, Menu, X, Zap, UserCog, ShieldCheck, Home, ChevronDown
} from 'lucide-react';

const NavDropdown = ({ label, items, active }) => {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef(null);
    const dropdownRef = useRef(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 200); // 200ms grace period
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (items.length === 0) return null;

    return (
        <div 
            className="relative" 
            ref={dropdownRef} 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
        >
            <button
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                        ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
            >
                {label}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 pt-2 w-48 z-50 animate-fade-in">
                    <div className="py-2 bg-surface-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-glow-sm overflow-hidden">
                        {items.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                            >
                                <Icon className="w-4 h-4 text-slate-500" />
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isPublicPage = ['/login', '/register'].includes(location.pathname);

    if (!user || isPublicPage) return null;

    const effectiveRole = (user.role === 'faculty' && user.isApproved === false) ? 'student' : user.role;
    const isFacultyPending = user.role === 'faculty' && user.isApproved === false;

    const dashboardPath =
        user.role === 'admin' ? '/admin/dashboard' :
            effectiveRole === 'student' ? '/student/dashboard' :
                (user.role === 'faculty' || user.role === 'coordinator') ? '/coordinator/dashboard' :
                    '/dashboard';

    // Grouping links
    const mainLinks = [
        { to: '/', label: 'Home', icon: Home, roles: ['admin', 'faculty', 'coordinator', 'student'] },
        { to: dashboardPath, label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'faculty', 'coordinator', 'student'] },
    ].filter(link => link.roles.includes(effectiveRole));

    const eventLinks = [
        { to: '/events', label: 'Browse Events', icon: CalendarDays, roles: ['student'] },
        { to: '/events/manage', label: 'Manage Events', icon: FolderKanban, roles: ['faculty', 'coordinator', 'student'] },
        { to: '/events/manage', label: 'Events', icon: FolderKanban, roles: ['admin'] },
        { to: '/events/create', label: 'Create Event', icon: Zap, roles: ['faculty'] },
        { to: '/events/pending', label: 'Pending Approval', icon: Clock, roles: ['admin', 'faculty'] },
        { to: '/my-registrations', label: 'My Registrations', icon: BookMarked, roles: ['student'] },
    ].filter(link => link.roles.includes(effectiveRole));

    const analyticsLinks = [
        { to: '/attendance', label: 'Attendance', icon: Users, roles: ['faculty', 'coordinator'] },
        { to: '/my-attendance', label: 'My Attendance', icon: ClipboardCheck, roles: ['student'] },
        { to: '/reports', label: 'Reports', icon: BarChart2, roles: ['admin', 'faculty', 'coordinator'] },
    ].filter(link => link.roles.includes(effectiveRole));

    const adminLinks = [
        { to: '/admin/pending-users', label: 'Pending Users', icon: ShieldCheck, roles: ['admin', 'faculty'] },
        { to: '/admin/users', label: 'All Users', icon: UserCog, roles: ['admin'] },
        { to: '/admin/audit-log', label: 'Audit Log', icon: ShieldCheck, roles: ['admin'] },
    ].filter(link => link.roles.includes(effectiveRole));

    const isActive = (to) => location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    const isGroupActive = (links) => links.some(link => isActive(link.to));

    return (
        <>
            <nav className="sticky top-0 z-50 bg-surface-800/70 backdrop-blur-xl border-b border-white/[0.07] shadow-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <Link to={dashboardPath} className="flex items-center gap-2.5 group flex-shrink-0">
                            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shadow-glow-sm transition-all duration-300 group-hover:shadow-glow">
                                <Zap className="w-4 h-4 text-white" />
                            </span>
                            <span className="hidden sm:block font-display font-extrabold text-lg tracking-tight">
                                <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-brand-100 bg-clip-text text-transparent">Event</span>
                                <span className="text-white"> Sphere</span>
                            </span>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden lg:flex items-center gap-1">
                            {mainLinks.map(({ to, label, icon: Icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${isActive(to)
                                            ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </Link>
                            ))}

                            {/* Dropdowns for many links */}
                            {effectiveRole === 'student' ? (
                                eventLinks.map(({ to, label, icon: Icon }) => (
                                    <Link key={to} to={to} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(to) ? 'bg-brand-500/15 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                        {label}
                                    </Link>
                                ))
                            ) : (
                                <NavDropdown label="Events" items={eventLinks} active={isGroupActive(eventLinks)} />
                            )}

                            {effectiveRole !== 'student' && analyticsLinks.length > 0 && (
                                <NavDropdown label="Analytics" items={analyticsLinks.filter(l => l.to !== '/my-attendance')} active={isGroupActive(analyticsLinks)} />
                            )}
                            {effectiveRole === 'admin' && adminLinks.length > 0 && <NavDropdown label="Admin" items={adminLinks} active={isGroupActive(adminLinks)} />}
                            
                            {effectiveRole === 'student' && analyticsLinks.map(({ to, label, icon: Icon }) => (
                                <Link key={to} to={to} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(to) ? 'bg-brand-500/15 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </Link>
                            ))}
                        </div>

                        {/* Right Side – User + Logout */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link to="/profile" className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors group">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left hidden lg:block">
                                    <p className="text-xs font-semibold text-white leading-none">{user.name}</p>
                                    <p className="text-[10px] text-brand-400 capitalize mt-0.5">
                                        {user.role}{isFacultyPending && ' (Pending Approval)'}
                                    </p>
                                </div>
                            </Link>
                            <button
                                onClick={logout}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                                           text-red-400 hover:text-red-300 hover:bg-red-500/10
                                           border border-transparent hover:border-red-500/20
                                           transition-all duration-200"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Logout</span>
                            </button>
                        </div>

                        {/* Mobile Hamburger */}
                        <button
                            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                            onClick={() => setMobileOpen(o => !o)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 top-16 z-40 bg-surface-900/95 backdrop-blur-xl border-t border-white/[0.06] overflow-y-auto animate-fade-in">
                    <div className="px-4 py-6 space-y-1">
                        {[...mainLinks, ...eventLinks, ...analyticsLinks, ...adminLinks].map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                    ${isActive(to)
                                        ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                                        : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                                    }`}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {label}
                            </Link>
                        ))}

                        <div className="divider" />

                        {/* Mobile user */}
                        <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] rounded-xl transition-all">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{user.name}</p>
                                <p className="text-xs text-brand-400 capitalize">{user.role}</p>
                            </div>
                        </Link>

                        <button
                            onClick={() => { setMobileOpen(false); logout(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                                       text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navigation;
