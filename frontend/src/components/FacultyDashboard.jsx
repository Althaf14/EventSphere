import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Plus, CalendarDays, Loader2, ArrowRight } from 'lucide-react';

const FacultyDashboard = () => {
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/events/my')
            .then(({ data }) => setMyEvents(data))
            .catch((err) => setError(err.response?.data?.message || 'Failed to fetch events'))
            .finally(() => setLoading(false));
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return 'badge-success';
            case 'rejected': return 'badge-error';
            default: return 'badge-warning';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Quick Action */}
            <div className="card">
                <h3 className="card-title mb-4">Quick Actions</h3>
                <button onClick={() => navigate('/events/create')} className="btn-primary">
                    <Plus className="w-4 h-4" /> Create New Event
                </button>
            </div>

            {/* Events Table */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="section-heading mb-0">My Events</h3>
                    <button onClick={() => navigate('/events/manage')} className="btn-ghost flex items-center gap-1 text-brand-400 hover:text-brand-300">
                        Manage all <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                    </div>
                )}
                {error && <div className="alert-error">{error}</div>}

                {!loading && !error && (
                    <div className="table-container">
                        {myEvents.length === 0 ? (
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
                                        <th className="table-th">Title</th>
                                        <th className="table-th">Date</th>
                                        <th className="table-th">Status</th>
                                        <th className="table-th">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myEvents.map((event) => (
                                        <tr key={event._id} className="table-row">
                                            <td className="table-cell-bold">{event.title}</td>
                                            <td className="table-cell">{new Date(event.date).toLocaleDateString()}</td>
                                            <td className="table-cell">
                                                <span className={getStatusBadge(event.status)}>{event.status}</span>
                                            </td>
                                            <td className="table-cell">
                                                <button
                                                    onClick={() => navigate(`/dashboard/event/${event._id}/registrations`)}
                                                    className="text-brand-400 hover:text-brand-300 font-semibold text-xs flex items-center gap-1 transition-colors"
                                                >
                                                    View Registrations <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyDashboard;
