import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Zap, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const { user } = useAuth();
 
    const dashboardPath = user ? (
        user.role === 'admin' ? '/admin/dashboard' :
            user.role === 'faculty' || user.role === 'coordinator' ? '/coordinator/dashboard' :
                user.role === 'student' ? '/student/dashboard' : '/dashboard'
    ) : null;
    return (
        <div className="min-h-screen relative overflow-hidden bg-surface-900 group">
            {/* ── Background Gradients ──────────────────────────────────────── */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/20 blur-[100px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[45%] rounded-full bg-teal-400/15 blur-[120px]" />
                <div className="absolute top-[40%] left-[30%] w-[20%] h-[20%] rounded-full bg-rose-500/10 blur-[80px]" />
                {/* Subtle grid pattern overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay" />
            </div>

            {/* ── Navbar (Guests only) ────────────────────────────────────────── */}
            {!user && (
                <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shadow-glow-sm">
                            <Zap className="w-5 h-5 text-white" />
                        </span>
                        <span className="font-display font-extrabold text-2xl tracking-tight">
                            <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-teal-200 bg-clip-text text-transparent">Event</span>
                            <span className="text-white"> Sphere</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                            Sign In
                        </Link>
                        <Link to="/register" className="btn-primary flex items-center gap-2 group/btn">
                            Get Started
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </nav>
            )}

            {/* ── Hero Section ────────────────────────────────────────────────── */}
            <main className={`relative z-10 flex flex-col items-center justify-center px-4 text-center max-w-5xl mx-auto animate-fade-in-up ${user ? 'pt-16 pb-24' : 'pt-24 pb-32'}`}>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-semibold mb-8 backdrop-blur-md">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
                    </span>
                    The ultimate event platform
                </div>

                {/* Headline */}
                <h1 className="font-display text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                    Manage college events <br className="hidden md:block" />
                    with <span className="bg-gradient-to-r from-brand-400 to-teal-200 bg-clip-text text-transparent">absolute precision</span>.
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                    From academic conferences to cultural fests. Streamline registrations, track attendance, and issue certificates automatically in one unified platform.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {!user ? (
                        <>
                            <Link to="/register" className="btn-primary-lg w-full sm:w-auto group/btn flex items-center justify-center gap-2">
                                Start for free
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/login" className="px-8 py-3.5 rounded-xl border border-white/10 text-white font-bold bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all shadow-xl hover:shadow-2xl hover:border-white/20 w-full sm:w-auto text-center">
                                View Dashboard
                            </Link>
                        </>
                    ) : (
                        <Link to={dashboardPath} className="btn-primary-lg w-full sm:min-w-[200px] group/btn flex items-center justify-center gap-2">
                            Go to Dashboard
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    )}
                </div>

            </main>

            {/* ── Features Grid ────────────────────────────────────────────────── */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Feature 1 */}
                    <div className="p-8 rounded-3xl bg-surface-800/40 border border-white/[0.05] backdrop-blur-md hover:bg-surface-800/60 hover:border-brand-500/30 transition-all duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center mb-6">
                            <CalendarDays className="w-7 h-7 text-brand-400" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-white mb-3">Smart Scheduling</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Create single or multi-day events with advanced capacity limits, deadlines, and multi-tier approval workflows.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-8 rounded-3xl bg-surface-800/40 border border-white/[0.05] backdrop-blur-md hover:bg-surface-800/60 hover:border-teal-400/30 transition-all duration-300 translate-y-0 md:translate-y-8">
                        <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-6">
                            <Users className="w-7 h-7 text-teal-400" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-white mb-3">Live Attendance</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Track real-time check-ins using zero-friction workflows. Export formatted Excel reports instantly.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-8 rounded-3xl bg-surface-800/40 border border-white/[0.05] backdrop-blur-md hover:bg-surface-800/60 hover:border-rose-400/30 transition-all duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-6">
                            <ShieldCheck className="w-7 h-7 text-rose-400" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-white mb-3">Role-Based Access</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Dedicated portals for Students, Faculty, Coordinators, and Admins to ensure secure data handling.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Blog / About Section ────────────────────────────────────────── */}
            <section id="blog" className="relative z-10 bg-surface-900 border-t border-white/[0.05] py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 text-brand-300 text-sm font-semibold mb-4">
                            Insights
                        </div>
                        <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">Behind Event Sphere</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Discover why we built this platform and how it's shaping the future of college events.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Blog Post 1 */}
                        <div className="group rounded-3xl bg-surface-800/40 border border-white/[0.05] overflow-hidden hover:bg-surface-800/60 hover:border-brand-500/30 transition-all duration-300">
                            <div className="h-48 bg-gradient-to-br from-brand-600/20 to-teal-500/10 flex items-center justify-center p-8">
                                <Zap className="w-16 h-16 text-brand-400 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="p-8">
                                <div className="text-xs font-bold text-brand-400 tracking-wider uppercase mb-3">Origin Story</div>
                                <h3 className="font-display text-2xl font-bold text-white mb-3 group-hover:text-brand-300 transition-colors">Why We Built Event Sphere</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                    Managing college events used to mean endless spreadsheets, lost attendance sheets, and delayed certificates. We built Event Sphere to solve these problems natively, providing a unified platform where students, coordinators, and faculty can collaborate seamlessly.
                                </p>
                                <a href="#" className="font-medium text-brand-400 flex items-center gap-2 hover:text-brand-300 transition-colors">
                                    Read more <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Blog Post 2 */}
                        <div className="group rounded-3xl bg-surface-800/40 border border-white/[0.05] overflow-hidden hover:bg-surface-800/60 hover:border-teal-400/30 transition-all duration-300">
                            <div className="h-48 bg-gradient-to-br from-teal-500/20 to-blue-500/10 flex items-center justify-center p-8">
                                <ShieldCheck className="w-16 h-16 text-teal-400 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="p-8">
                                <div className="text-xs font-bold text-teal-400 tracking-wider uppercase mb-3">Feature Spotlight</div>
                                <h3 className="font-display text-2xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors">The Security Behind Certificates</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                    Fake participation certificates are a thing of the past. Our automated certificate generation uses dynamic data binding directly from secure physical attendance logs, ensuring that only students who were genuinely present receive valid, verifiable credentials.
                                </p>
                                <a href="#" className="font-medium text-teal-400 flex items-center gap-2 hover:text-teal-300 transition-colors">
                                    Read more <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;
