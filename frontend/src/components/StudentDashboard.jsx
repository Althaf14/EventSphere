import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { BookMarked, ClipboardCheck, CalendarDays, Loader2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

const StudentDashboard = () => {
    const [stats, setStats] = useState({
        totalRegistrations: 0,
        upcomingEvents: [],
        attendanceSummary: { present: 0, absent: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/dashboard/student')
            .then(({ data }) => setStats(data))
            .catch(() => setError('Failed to load dashboard data'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
    );
    if (error) return <div className="alert-error">{error}</div>;

    const total = (stats.attendanceSummary.present || 0) + (stats.attendanceSummary.absent || 0);
    const attendancePct = total ? Math.round((stats.attendanceSummary.present / total) * 100) : 0;

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Registrations */}
                <div className="stat-card">
                    <div className="stat-card-icon bg-brand-500/20">
                        <BookMarked className="w-6 h-6 text-brand-400" />
                    </div>
                    <div className="flex-1">
                        <p className="stat-card-label">Total Registrations</p>
                        <p className="stat-card-value">{stats.totalRegistrations}</p>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-brand-500/15 to-transparent rounded-r-2xl pointer-events-none" />
                </div>

                {/* Attendance */}
                <div className="stat-card flex-col items-start gap-4">
                    <div className="flex items-center gap-4 w-full">
                        <div className="stat-card-icon bg-emerald-500/20">
                            <ClipboardCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <p className="stat-card-label">Attendance Rate</p>
                            <p className="stat-card-value">{attendancePct}%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                                <CheckCircle className="w-3.5 h-3.5" />{stats.attendanceSummary.present} Present
                            </p>
                            <p className="text-xs text-red-400 font-semibold flex items-center gap-1 justify-end mt-0.5">
                                <XCircle className="w-3.5 h-3.5" />{stats.attendanceSummary.absent} Absent
                            </p>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="progress-track w-full">
                        <div
                            className="progress-bar"
                            style={{ width: `${attendancePct}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Upcoming Events */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="section-heading mb-0">Recent Registrations</h3>
                    <button onClick={() => navigate('/events')} className="btn-ghost flex items-center gap-1 text-brand-400 hover:text-brand-300">
                        Browse all <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="table-container">
                    {stats.upcomingEvents.length === 0 ? (
                        <div className="empty-state py-14">
                            <div className="empty-state-icon"><CalendarDays className="w-8 h-8" /></div>
                            <h4 className="font-display text-lg font-semibold text-white mb-2">No recent registrations</h4>
                            <p className="text-slate-400 text-sm mb-5">You haven't registered for any events recently.</p>
                            <button onClick={() => navigate('/events')} className="btn-primary">
                                Browse Events
                            </button>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="table-header-row">
                                    <th className="table-th">Event</th>
                                    <th className="table-th">Date</th>
                                    <th className="table-th">Venue</th>
                                    <th className="table-th">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.upcomingEvents.map((event) => (
                                    <tr key={event._id} className="table-row">
                                        <td className="table-cell-bold">{event.title}</td>
                                        <td className="table-cell">{new Date(event.eventDate).toLocaleDateString()}</td>
                                        <td className="table-cell">{event.venue}</td>
                                        <td className="table-cell">
                                            <button
                                                onClick={() => navigate(`/events/${event._id}`)}
                                                className="text-brand-400 hover:text-brand-300 font-semibold text-xs flex items-center gap-1 transition-colors"
                                            >
                                                View <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h3 className="card-title mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => navigate('/events')} className="btn-primary">
                        <CalendarDays className="w-4 h-4" /> Browse Events
                    </button>
                    <button onClick={() => navigate('/my-registrations')} className="btn-secondary">
                        <BookMarked className="w-4 h-4" /> My Registrations
                    </button>
                    <button onClick={() => navigate('/my-attendance')} className="btn-secondary">
                        <ClipboardCheck className="w-4 h-4" /> My Attendance
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
