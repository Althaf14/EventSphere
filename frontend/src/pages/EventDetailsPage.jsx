import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    Calendar, MapPin, Clock, Users, ArrowLeft, Sparkles,
    CheckCircle, ShieldCheck, UserCog, Edit, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import ManageCoordinatorsModal from '../components/ManageCoordinatorsModal';

const EventDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [subEvents, setSubEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCoordinatorsModal, setShowCoordinatorsModal] = useState(false);

    useEffect(() => {
        fetchEventDetails();
        if (user?.role === 'student') fetchMyRegistrations();
    }, [id, user]);

    const fetchEventDetails = async () => {
        try {
            const { data } = await api.get(`/events/${id}`);
            setEvent(data);
            if (data.subEvents) setSubEvents(data.subEvents);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch event details');
            toast.error('Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRegistrations = async () => {
        try {
            const { data } = await api.get('/registrations/my');
            setRegistrations(data.map(reg => reg.event._id));
        } catch { }
    };

    const handleRegister = async (eventId) => {
        try {
            await api.post(`/events/${eventId}/register`);
            toast.success('Registration Successful!');
            setRegistrations(prev => [...prev, eventId]);
            setSubEvents(prev => prev.map(ev => ev._id === eventId ? { ...ev, registeredCount: (ev.registeredCount || 0) + 1 } : ev));
            if (event._id === eventId) setEvent(prev => ({ ...prev, registeredCount: (prev.registeredCount || 0) + 1 }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleUnregister = async (eventId) => {
        try {
            await api.delete(`/events/${eventId}/unregister`);
            toast.success('Unregistered Successfully');
            setRegistrations(prev => prev.filter(i => i !== eventId));
            setSubEvents(prev => prev.map(ev => ev._id === eventId ? { ...ev, registeredCount: Math.max((ev.registeredCount || 0) - 1, 0) } : ev));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Unregister failed');
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
        </div>
    );

    if (error || !event) return (
        <div className="page-wrapper flex flex-col items-center justify-center min-h-[50vh] gap-5">
            <div className="alert-error max-w-sm text-center">{error || 'Event not found'}</div>
            <button onClick={() => navigate('/events')} className="btn-primary">
                <ArrowLeft className="w-4 h-4" /> Back to Events
            </button>
        </div>
    );

    const isBigEvent = event.eventType === 'MULTI';
    const isRegistered = registrations.includes(event._id);
    const isFull = event.maxParticipants && event.registeredCount >= event.maxParticipants;
    const isUpcoming = event.status === 'Upcoming';
    const canManage = user && (user.role === 'admin' || event.createdBy?._id === user._id || event.coordinators?.some(c => c._id === user._id));

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Upcoming': return 'badge-success';
            case 'Ongoing': return 'badge-info';
            case 'Completed': return 'badge-gray';
            default: return 'badge-gray';
        }
    };

    return (
        <div className="page-wrapper animate-fade-in-up max-w-5xl mx-auto">
            {/* Back */}
            <button onClick={() => navigate('/events')} className="btn-ghost mb-6 -ml-2">
                <ArrowLeft className="w-4 h-4" /> Back to Events
            </button>

            {/* ── Main Event Card ──────────────────────────── */}
            <div className="card-lg mb-8">
                {/* Event Image */}
                {event.eventImage && (
                    <div className="-mx-8 -mt-8 mb-8 h-64 overflow-hidden rounded-t-2xl">
                        <img
                            src={`http://localhost:5000${event.eventImage}`}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Title + Status */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={getStatusBadge(event.status)}>{event.status}</span>
                            {isBigEvent && (
                                <span className="badge-purple flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Big Event
                                </span>
                            )}
                        </div>
                        <h1 className="font-display text-3xl lg:text-4xl font-extrabold text-white mb-2 leading-tight">
                            {event.title}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {event.department || 'General'} &bull; {event.category || 'Event'}
                        </p>
                    </div>
                </div>

                {/* Management Buttons */}
                {canManage && (
                    <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-white/[0.06]">
                        <button onClick={() => navigate(`/events/edit/${id}`)} className="btn-primary">
                            <Edit className="w-4 h-4" /> Edit Event
                        </button>
                        <button onClick={() => setShowCoordinatorsModal(true)} className="btn-secondary">
                            <UserCog className="w-4 h-4" /> Coordinators
                        </button>
                        <button onClick={() => navigate(`/dashboard/event/${id}/registrations`)} className="btn-secondary">
                            <Users className="w-4 h-4" /> Registrations
                        </button>
                        <button onClick={() => navigate('/attendance')} className="btn-secondary">
                            <ShieldCheck className="w-4 h-4" /> Attendance
                        </button>
                    </div>
                )}

                {/* Event Meta Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-start gap-3 bg-surface-700/30 rounded-xl p-4 border border-white/[0.05]">
                        <Calendar className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-0.5">Date</p>
                            <p className="text-white font-semibold text-sm">
                                {new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    {!isBigEvent && event.startTime && (
                        <div className="flex items-start gap-3 bg-surface-700/30 rounded-xl p-4 border border-white/[0.05]">
                            <Clock className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-0.5">Time</p>
                                <p className="text-white font-semibold text-sm">{event.startTime} – {event.endTime || 'TBD'}</p>
                            </div>
                        </div>
                    )}
                    {!isBigEvent && event.venue && (
                        <div className="flex items-start gap-3 bg-surface-700/30 rounded-xl p-4 border border-white/[0.05]">
                            <MapPin className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-0.5">Venue</p>
                                <p className="text-white font-semibold text-sm">{event.venue}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Description */}
                {event.description && (
                    <div className="mb-6">
                        <h3 className="font-display text-lg font-semibold text-white mb-2">About</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">{event.description}</p>
                    </div>
                )}

                {/* Registration (SINGLE events only, student) */}
                {!isBigEvent && user?.role === 'student' && (
                    <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Capacity</p>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-brand-400" />
                                <span className="text-white font-semibold text-sm">
                                    {event.registeredCount || 0} / {event.maxParticipants || '∞'} participants
                                </span>
                                {isFull && <span className="badge-error">Full</span>}
                            </div>
                        </div>
                        {isRegistered ? (
                            <button
                                onClick={() => handleUnregister(event._id)}
                                className="btn-danger"
                            >
                                <ShieldCheck className="w-4 h-4" /> Registered (Click to Unregister)
                            </button>
                        ) : (
                            <button
                                onClick={() => handleRegister(event._id)}
                                disabled={isFull || !isUpcoming}
                                className={isFull || !isUpcoming ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary-lg'}
                            >
                                <CheckCircle className="w-4 h-4" />
                                {isFull ? 'Event Full' : !isUpcoming ? `Event ${event.status}` : 'Register Now'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Sub Events ───────────────────────────────── */}
            {isBigEvent && (
                <div className="animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="section-tag">
                            <Sparkles className="w-3.5 h-3.5" /> Sub Events
                        </div>
                    </div>

                    {subEvents.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon bg-violet-500/10 border border-violet-500/20">
                                <Sparkles className="w-9 h-9 text-violet-400/60" />
                            </div>
                            <p className="text-slate-400 text-sm">No sub-events have been added yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {subEvents.map(subEvent => {
                                const isSubRegistered = registrations.includes(subEvent._id);
                                const isSubFull = subEvent.maxParticipants && subEvent.registeredCount >= subEvent.maxParticipants;
                                const isSubUpcoming = subEvent.status === 'Upcoming';
                                const fillPct = subEvent.maxParticipants ? Math.min(((subEvent.registeredCount || 0) / subEvent.maxParticipants) * 100, 100) : 0;

                                return (
                                    <div key={subEvent._id} className="card border-violet-500/15 hover:border-violet-500/30 transition-all duration-300 flex flex-col">
                                        <h3 className="font-display text-lg font-bold text-white mb-4">{subEvent.title}</h3>

                                        <div className="space-y-2 mb-5 text-xs text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                                                {new Date(subEvent.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                            {subEvent.startTime && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                                                    {subEvent.startTime} – {subEvent.endTime || 'TBD'}
                                                </div>
                                            )}
                                            {subEvent.venue && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                                    {subEvent.venue}
                                                </div>
                                            )}
                                        </div>

                                        {/* Capacity */}
                                        <div className="mb-4 space-y-1.5">
                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Capacity</span>
                                                <span className={isSubFull ? 'text-red-400 font-semibold' : ''}>
                                                    {subEvent.registeredCount || 0} / {subEvent.maxParticipants || '∞'}
                                                </span>
                                            </div>
                                            <div className="progress-track">
                                                <div style={{ width: `${fillPct}%` }} className={isSubFull ? 'progress-bar-full' : 'progress-bar'} />
                                            </div>
                                        </div>

                                        {/* Register Button  */}
                                        {user?.role === 'student' && (
                                            <div className="mt-auto">
                                                {isSubRegistered ? (
                                                    <button
                                                        onClick={() => handleUnregister(subEvent._id)}
                                                        className="w-full btn-danger justify-center text-xs"
                                                    >
                                                        <ShieldCheck className="w-3.5 h-3.5" /> Registered
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRegister(subEvent._id)}
                                                        disabled={isSubFull || !isSubUpcoming}
                                                        className={`w-full justify-center text-xs ${isSubFull || !isSubUpcoming
                                                            ? 'btn-secondary opacity-50 cursor-not-allowed'
                                                            : 'btn-primary'}`}
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        {isSubFull ? 'Full' : !isSubUpcoming ? subEvent.status : 'Register'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <ManageCoordinatorsModal
                eventId={id}
                isOpen={showCoordinatorsModal}
                onClose={() => setShowCoordinatorsModal(false)}
                onUpdate={fetchEventDetails}
            />
        </div>
    );
};

export default EventDetailsPage;
