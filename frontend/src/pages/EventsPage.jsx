import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { Search, Filter, Plus, Loader2, Sparkles, CalendarDays } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/events');
                setEvents(data);
                const uniqueCategories = ['All', ...new Set(data.map(e => e.category).filter(Boolean))];
                setCategories(uniqueCategories);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch events');
                toast.error('Failed to load events');
            }
        };
        const fetchMyRegistrations = async () => {
            if (user?.role === 'student') {
                try {
                    const { data } = await api.get('/registrations/my');
                    setMyRegistrations(data.map(reg => reg.event._id));
                } catch { }
            }
        };
        Promise.all([fetchEvents(), fetchMyRegistrations()]).then(() => setLoading(false));
    }, [user]);

    const filteredEvents = useMemo(() => {
        let result = events;
        if (selectedCategory !== 'All') result = result.filter(e => e.category === selectedCategory);
        if (searchTerm) result = result.filter(e =>
            e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.venue?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return result;
    }, [events, searchTerm, selectedCategory]);

    const handleRegister = async (eventId) => {
        try {
            await api.post(`/events/${eventId}/register`);
            toast.success('Registration Successful!');
            setMyRegistrations(prev => [...prev, eventId]);
            setEvents(prev => prev.map(ev => ev._id === eventId ? { ...ev, registeredCount: (ev.registeredCount || 0) + 1 } : ev));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleUnregister = async (eventId) => {
        try {
            await api.delete(`/events/${eventId}/unregister`);
            toast.success('Unregistered Successfully');
            setMyRegistrations(prev => prev.filter(id => id !== eventId));
            setEvents(prev => prev.map(ev => ev._id === eventId ? { ...ev, registeredCount: Math.max((ev.registeredCount || 0) - 1, 0) } : ev));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Unregistration failed');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="text-center">
                <Loader2 className="w-10 h-10 text-brand-400 animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Loading events…</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex justify-center items-center px-4">
            <div className="alert-error max-w-sm">{error}</div>
        </div>
    );

    return (
        <div className="page-wrapper animate-fade-in-up">
            {/* ── Hero Header ──────────────────────────────── */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
                <div className="max-w-2xl">
                    <div className="section-tag">
                        <Sparkles className="w-3.5 h-3.5" />
                        Events
                    </div>
                    <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-none">
                        Discover<br />
                        <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-violet-400 bg-clip-text text-transparent">
                            Amazing Events
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base lg:text-lg leading-relaxed max-w-xl">
                        Join workshops, hackathons, and cultural fests. Elevate your college experience
                        with unforgettable moments.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    {user && (user.role === 'admin' || user.role === 'coordinator' || user.role === 'faculty') && (
                        <button onClick={() => navigate('/events/create')} className="btn-primary-lg">
                            <Plus className="w-5 h-5" /> Create Event
                        </button>
                    )}
                    {user?.role === 'student' && (
                        <button onClick={() => navigate('/my-registrations')} className="btn-secondary" style={{ paddingTop: '14px', paddingBottom: '14px' }}>
                            <CalendarDays className="w-4 h-4 text-brand-400" /> My Schedule
                        </button>
                    )}
                </div>
            </div>

            {/* ── Search & Filter Bar ───────────────────────── */}
            <div className="sticky top-16 z-40 mb-10">
                <div className="bg-surface-800/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-card-lg">
                    {/* Search */}
                    <div className="relative flex-grow group">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                        </span>
                        <input
                            id="events-search"
                            type="text"
                            className="block w-full pl-10 pr-4 py-3 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none rounded-xl focus:bg-white/[0.04] transition-all"
                            placeholder="Search events by name, description, venue…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="w-px bg-white/[0.06] hidden sm:block" />

                    {/* Category Filter */}
                    <div className="relative min-w-[200px] group">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                        </span>
                        <select
                            id="events-category-filter"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="block w-full pl-10 pr-8 py-3 bg-transparent text-sm text-white focus:outline-none rounded-xl appearance-none cursor-pointer focus:bg-white/[0.04] transition-all"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Results Count ─────────────────────────────── */}
            {!loading && (
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-slate-400 text-sm">
                        Showing <span className="text-white font-semibold">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? 's' : ''}
                        {selectedCategory !== 'All' && <> in <span className="text-brand-400">{selectedCategory}</span></>}
                    </span>
                </div>
            )}

            {/* ── Events Grid ───────────────────────────────── */}
            {filteredEvents.length === 0 ? (
                <div className="empty-state py-28 animate-fade-in">
                    <div className="empty-state-icon">
                        <Search className="w-9 h-9" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">No events found</h3>
                    <p className="text-slate-400 max-w-sm mb-6 text-sm">
                        We couldn't find any events matching your criteria. Try adjusting your filters.
                    </p>
                    <button
                        onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                        className="btn-secondary"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <EventCard
                            key={event._id}
                            event={event}
                            user={user}
                            isRegistered={myRegistrations.includes(event._id)}
                            onRegister={handleRegister}
                            onUnregister={handleUnregister}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventsPage;
