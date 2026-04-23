import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BookMarked, Calendar, MapPin, Clock, Award, Loader2 } from 'lucide-react';

const MyRegistrationsPage = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/registrations/my')
            .then(({ data }) => setRegistrations(data))
            .catch((err) => setError(err.response?.data?.message || 'Failed to fetch registrations'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
    );

    return (
        <div className="page-wrapper animate-fade-in-up">
            {/* Header */}
            <div className="mb-10">
                <div className="section-tag"><BookMarked className="w-3.5 h-3.5" /> Student Portal</div>
                <h1 className="page-heading mb-1">My Registrations</h1>
                <p className="text-slate-400 text-sm">All events you have registered for.</p>
            </div>

            {error && <div className="alert-error mb-6">{error}</div>}

            {registrations.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><BookMarked className="w-9 h-9" /></div>
                    <h2 className="font-display text-2xl font-bold text-white mb-2">No Registrations Yet</h2>
                    <p className="text-slate-400 text-sm">You have not registered for any events yet.</p>
                </div>
            ) : (
                <div className="table-container overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-th">Event</th>
                                <th className="table-th">Date &amp; Time</th>
                                <th className="table-th">Venue</th>
                                <th className="table-th">Status</th>
                                <th className="table-th">Attendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrations.map((reg) => (
                                <tr key={reg._id} className="table-row">
                                    <td className="table-cell-bold">{reg.event?.title || 'Unknown Event'}</td>
                                    <td className="table-cell">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                            {reg.event?.eventDate ? new Date(reg.event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'N/A'}
                                            {reg.event?.startTime && (
                                                <>
                                                    <Clock className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 ml-1" />
                                                    {reg.event.startTime}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                                            {reg.event?.venue || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="table-cell capitalize">
                                        <span className={reg.status === 'registered' ? 'badge-success' : 'badge-error'}>
                                            {reg.status}
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        {reg.attendance ? (
                                            <div className="flex items-center gap-3">
                                                <span className="badge-success">Present</span>
                                                <button
                                                    onClick={() => window.open(`/report/${reg._id}`, '_blank')}
                                                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs font-semibold transition-colors"
                                                >
                                                    <Award className="w-3.5 h-3.5" /> Certificate
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 text-xs italic">Not marked</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyRegistrationsPage;
