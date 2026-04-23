import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, ClipboardCheck, CalendarDays, Loader2, ArrowRight } from 'lucide-react';

const CoordinatorDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/dashboard/coordinator')
            .then(({ data }) => setEvents(data.myEvents || []))
            .catch(() => setError('Failed to load your events'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
    );
    if (error) return <div className="alert-error">{error}</div>;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Upcoming': return 'badge-info';
            case 'Ongoing': return 'badge-warning';
            case 'Completed': return 'badge-success';
            default: return 'badge-gray';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Quick Actions */}
            <div className="card">
                <h3 className="card-title mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => navigate('/events/create')} className="btn-primary">
                        <Plus className="w-4 h-4" /> Create New Event
                    </button>
                    <button onClick={() => navigate('/attendance')} className="btn-secondary">
                        <ClipboardCheck className="w-4 h-4" /> Mark Attendance
                    </button>
                </div>
            </div>

            {/* My Events Table */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="section-heading mb-0">My Created Events</h3>
                    <button onClick={() => navigate('/events/manage')} className="btn-ghost flex items-center gap-1 text-brand-400 hover:text-brand-300">
                        Manage all <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="table-container">
                    {events.length === 0 ? (
                        <div className="empty-state py-14">
                            <div className="empty-state-icon"><CalendarDays className="w-8 h-8" /></div>
                            <h4 className="font-display text-lg font-semibold text-white mb-2">No events yet</h4>
                            <p className="text-slate-400 text-sm mb-5">You haven't created any events yet.</p>
                            <button onClick={() => navigate('/events/create')} className="btn-primary">
                                <Plus className="w-4 h-4" /> Create Your First Event
                            </button>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="table-header-row">
                                    <th className="table-th">Event Title</th>
                                    <th className="table-th">Date</th>
                                    <th className="table-th">Status</th>
                                    <th className="table-th-center">Registrations</th>
                                    <th className="table-th-center">Attendance</th>
                                    <th className="table-th">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event._id} className="table-row">
                                        <td className="table-cell-bold">{event.title}</td>
                                        <td className="table-cell">{new Date(event.eventDate).toLocaleDateString()}</td>
                                        <td className="table-cell">
                                            <span className={getStatusBadge(event.status)}>{event.status}</span>
                                        </td>
                                        <td className="table-cell-center font-semibold text-white">{event.registeredCount}</td>
                                        <td className="table-cell-center">
                                            {event.attendanceMarked ? (
                                                <span className="badge-success">Completed</span>
                                            ) : (
                                                <span className="badge-warning">Pending</span>
                                            )}
                                        </td>
                                        <td className="table-cell">
                                            <button
                                                onClick={() => navigate(`/dashboard/event/${event._id}/registrations`)}
                                                className="text-brand-400 hover:text-brand-300 font-semibold text-xs flex items-center gap-1 transition-colors"
                                            >
                                                View List <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoordinatorDashboard;
