import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Edit, Users, ShieldCheck, Plus, Calendar, MapPin, Clock, Loader2, FolderKanban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ManageEventsPage = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/events/my')
            .then(({ data }) => setEvents(data))
            .catch((err) => setError(err.response?.data?.message || 'Failed to fetch your events'))
            .finally(() => setLoading(false));
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Upcoming': return 'badge-info';
            case 'Ongoing': return 'badge-warning';
            case 'Completed': return 'badge-gray';
            default: return 'badge-gray';
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <div className="section-tag"><FolderKanban className="w-3.5 h-3.5" /> Event Management</div>
                    <h1 className="page-heading mb-1">Manage Events</h1>
                    <p className="text-slate-400 text-sm">Events you have created or are coordinating.</p>
                </div>
                <button onClick={() => navigate('/events/create')} className="btn-primary-lg flex-shrink-0">
                    <Plus className="w-5 h-5" /> Create New Event
                </button>
            </div>

            {error && <div className="alert-error mb-6">{error}</div>}

            {events.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><Calendar className="w-9 h-9" /></div>
                    <h2 className="font-display text-2xl font-bold text-white mb-2">No Events Found</h2>
                    <p className="text-slate-400 text-sm mb-6">You haven't created or been assigned to any events yet.</p>
                    <button onClick={() => navigate('/events/create')} className="btn-primary">
                        <Plus className="w-4 h-4" /> Create Your First Event
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event._id} className="card-hover flex flex-col overflow-hidden">
                            {/* Image */}
                            <div className="h-40 -mx-6 -mt-6 mb-5 relative overflow-hidden flex-shrink-0">
                                {event.eventImage ? (
                                    <img
                                        src={`http://localhost:5000${event.eventImage}`}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-900/60 to-surface-700">
                                        <Calendar className="w-10 h-10 text-brand-500/40" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-surface-800/80 to-transparent" />
                                <div className="absolute top-3 right-3">
                                    <span className={getStatusBadge(event.status)}>{event.status}</span>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-grow flex flex-col">
                                <h3 className="card-title mb-3 line-clamp-1">{event.title}</h3>

                                <div className="space-y-2 mb-5 text-sm text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                        <span>{new Date(event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    {event.startTime && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                                            <span>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</span>
                                        </div>
                                    )}
                                    {event.venue && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                                            <span className="truncate">{event.venue}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 mt-auto">
                                    <button
                                        onClick={() => navigate(`/events/edit/${event._id}`)}
                                        className="btn-primary w-full justify-center"
                                    >
                                        <Edit className="w-4 h-4" /> Edit Event
                                    </button>
                                    {user.role !== 'student' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/dashboard/event/${event._id}/registrations`)}
                                                className="btn-secondary flex-1 justify-center text-xs !py-2"
                                            >
                                                <Users className="w-3.5 h-3.5" /> Registrations
                                            </button>
                                            <button
                                                onClick={() => navigate(`/attendance?eventId=${event._id}`)}
                                                className="btn-secondary flex-1 justify-center text-xs !py-2"
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5" /> Attendance
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageEventsPage;
