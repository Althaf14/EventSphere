import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CalendarDays, Users, GraduationCap, Plus, ClipboardCheck, FolderKanban, Loader2, ArrowRight, TrendingUp, ClipboardList, UserCog } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalEvents: 0, totalRegistrations: 0, totalStudents: 0, recentEvents: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/dashboard/admin')
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

    const statCards = [
        {
            label: 'Total Events',
            value: stats.totalEvents,
            icon: CalendarDays,
            iconBg: 'bg-brand-500/20',
            iconColor: 'text-brand-400',
            accent: 'from-brand-500/20 to-transparent',
        },
        {
            label: 'Total Registrations',
            value: stats.totalRegistrations,
            icon: TrendingUp,
            iconBg: 'bg-emerald-500/20',
            iconColor: 'text-emerald-400',
            accent: 'from-emerald-500/20 to-transparent',
        },
        {
            label: 'Total Students',
            value: stats.totalStudents,
            icon: GraduationCap,
            iconBg: 'bg-violet-500/20',
            iconColor: 'text-violet-400',
            accent: 'from-violet-500/20 to-transparent',
        },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Upcoming': return 'badge-info';
            case 'Ongoing': return 'badge-warning';
            case 'Completed': return 'badge-gray';
            default: return 'badge-gray';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {statCards.map(({ label, value, icon: Icon, iconBg, iconColor, accent }) => (
                    <div key={label} className="stat-card">
                        <div className={`stat-card-icon ${iconBg}`}>
                            <Icon className={`w-6 h-6 ${iconColor}`} />
                        </div>
                        <div>
                            <p className="stat-card-label">{label}</p>
                            <p className="stat-card-value">{value}</p>
                        </div>
                        {/* Accent gradient overlay */}
                        <div className={`absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l ${accent} rounded-r-2xl pointer-events-none`} />
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h3 className="card-title mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => navigate('/events/create')} className="btn-primary">
                        <Plus className="w-4 h-4" /> Create Event
                    </button>
                    <button onClick={() => navigate('/attendance')} className="btn-secondary">
                        <ClipboardCheck className="w-4 h-4" /> Mark Attendance
                    </button>
                    <button onClick={() => navigate('/events/manage')} className="btn-secondary">
                        <FolderKanban className="w-4 h-4" /> Manage Events
                    </button>
                    <button onClick={() => navigate('/reports')} className="btn-secondary">
                        <TrendingUp className="w-4 h-4" /> View Reports
                    </button>
                    <button onClick={() => navigate('/admin/users')} className="btn-secondary">
                        <UserCog className="w-4 h-4" /> Manage Users
                    </button>
                    <button onClick={() => navigate('/admin/audit-log')} className="btn-secondary">
                        <ClipboardList className="w-4 h-4" /> Audit Log
                    </button>
                </div>
            </div>

            {/* Recent Events Table */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="section-heading mb-0">Recent Events</h3>
                    <button onClick={() => navigate('/events/manage')} className="btn-ghost flex items-center gap-1 text-brand-400 hover:text-brand-300">
                        View all <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="table-container">
                    {stats.recentEvents.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon"><CalendarDays className="w-8 h-8" /></div>
                            <p className="text-slate-400 text-sm">No events found.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="table-header-row">
                                    <th className="table-th">Event Title</th>
                                    <th className="table-th">Date</th>
                                    <th className="table-th">Venue</th>
                                    <th className="table-th">Status</th>
                                    <th className="table-th-center">Registrations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentEvents.map((event) => (
                                    <tr key={event._id} className="table-row">
                                        <td className="table-cell-bold">{event.title}</td>
                                        <td className="table-cell">{new Date(event.eventDate).toLocaleDateString()}</td>
                                        <td className="table-cell">{event.venue}</td>
                                        <td className="table-cell">
                                            <span className={getStatusBadge(event.status)}>{event.status}</span>
                                        </td>
                                        <td className="table-cell-center font-bold text-white">{event.registeredCount}</td>
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

export default AdminDashboard;
