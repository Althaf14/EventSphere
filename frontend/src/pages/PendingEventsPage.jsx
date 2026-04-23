import { useEffect, useState } from 'react';
import api from '../api/axios';
import { CheckCircle, XCircle, Calendar, Clock, MapPin, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const PendingEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(null);

    useEffect(() => { fetchPendingEvents(); }, []);

    const fetchPendingEvents = async () => {
        try {
            const { data } = await api.get('/events/pending');
            setEvents(data);
        } catch {
            setError('Failed to load pending events');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (eventId) => {
        setProcessing(eventId);
        try {
            await api.put(`/events/${eventId}/approve`);
            toast.success('Event Approved Successfully');
            setEvents(events.filter(e => e._id !== eventId));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve event');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (eventId) => {
        setProcessing(eventId);
        try {
            await api.put(`/events/${eventId}/reject`);
            toast.success('Event Rejected');
            setEvents(events.filter(e => e._id !== eventId));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject event');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
    );

    return (
        <div className="page-wrapper animate-fade-in-up">
            {/* Header */}
            <div className="mb-10">
                <div className="section-tag">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400">Requires Action</span>
                </div>
                <h1 className="page-heading mb-1">Pending Event Approvals</h1>
                <p className="text-slate-400 text-sm">
                    Review and approve or reject event submissions from coordinators.
                </p>
            </div>

            {error && <div className="alert-error mb-6">{error}</div>}

            {events.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="w-9 h-9 text-emerald-400" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white mb-2">All Caught Up!</h2>
                    <p className="text-slate-400 text-sm">There are no pending event requests at the moment.</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="badge-warning">{events.length} pending</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <div key={event._id} className="card flex flex-col overflow-hidden">
                                {/* Image */}
                                <div className="h-36 -mx-6 -mt-6 mb-5 relative overflow-hidden flex-shrink-0">
                                    {event.eventImage ? (
                                        <img
                                            src={`http://localhost:5000${event.eventImage}`}
                                            alt={event.title}
                                            className="w-full h-full object-cover opacity-80"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/30 to-surface-700">
                                            <Calendar className="w-10 h-10 text-amber-500/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface-800/80 to-transparent" />
                                    <div className="absolute top-3 left-3">
                                        <span className="badge-warning">Pending Approval</span>
                                    </div>
                                    {event.eventType === 'MULTI' && (
                                        <div className="absolute top-3 right-3">
                                            <span className="badge-purple flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> Multi-Event
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="flex-grow flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="card-title line-clamp-1 mb-1">{event.title}</h3>
                                        <p className="text-xs text-slate-400">
                                            By <span className="text-brand-400 font-semibold">{event.createdBy?.name || 'Unknown'}</span>
                                        </p>
                                    </div>

                                    <div className="space-y-2 mb-4 text-xs text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-brand-400" />
                                            <span>{new Date(event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-violet-400" />
                                            <span>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                            <span className="truncate">{event.venue}</span>
                                        </div>
                                    </div>

                                    {event.description && (
                                        <p className="text-slate-500 text-xs line-clamp-2 italic mb-4 leading-relaxed">
                                            "{event.description}"
                                        </p>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-auto">
                                        <button
                                            onClick={() => handleApprove(event._id)}
                                            disabled={processing === event._id}
                                            className="flex-1 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5
                                                       bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300
                                                       border border-emerald-500/20 hover:border-emerald-400/40
                                                       transition-all duration-200 disabled:opacity-50"
                                        >
                                            {processing === event._id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-3.5 h-3.5" />
                                            )}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(event._id)}
                                            disabled={processing === event._id}
                                            className="flex-1 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5
                                                       bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300
                                                       border border-red-500/20 hover:border-red-400/40
                                                       transition-all duration-200 disabled:opacity-50"
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default PendingEventsPage;
