import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Users, Loader2, CheckCircle, XCircle } from 'lucide-react';
import ExportBtn from '../components/ExportBtn';

const EventRegistrationsPage = () => {
    const { eventId } = useParams();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRegistrations = async () => {
        try {
            const { data } = await api.get(`/registrations/event/${eventId}`);
            setRegistrations(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch registrations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRegistrations(); }, [eventId]);

    const toggleAttendance = async (id, currentStatus) => {
        try {
            await api.put(`/registrations/${id}/attendance`, { attendance: !currentStatus });
            setRegistrations(registrations.map(reg =>
                reg._id === id ? { ...reg, attendance: !currentStatus } : reg
            ));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update attendance');
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
    );

    const presentCount = registrations.filter(r => r.attendance).length;

    return (
        <div className="page-wrapper animate-fade-in-up">
            {/* Header */}
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="section-tag"><Users className="w-3.5 h-3.5" /> Registration Management</div>
                    <h1 className="page-heading mb-1">Event Participants</h1>
                    <p className="text-slate-400 text-sm">
                        <span className="text-white font-semibold">{registrations.length}</span> registered ·{' '}
                        <span className="text-emerald-400 font-semibold">{presentCount}</span> present
                    </p>
                </div>
                <div className="flex gap-2.5">
                    <ExportBtn
                        url={`/reports/export?type=event-registrations&format=pdf&eventId=${eventId}`}
                        label="PDF"
                        type="pdf"
                    />
                    <ExportBtn
                        url={`/reports/export?type=event-registrations&format=excel&eventId=${eventId}`}
                        label="Excel"
                        type="excel"
                    />
                </div>
            </div>

            {error && <div className="alert-error mb-6">{error}</div>}

            {registrations.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><Users className="w-9 h-9" /></div>
                    <h2 className="font-display text-2xl font-bold text-white mb-2">No Registrations</h2>
                    <p className="text-slate-400 text-sm">No students have registered for this event yet.</p>
                </div>
            ) : (
                <div className="table-container overflow-x-auto">
                    <table className="w-full min-w-[520px]">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-th">#</th>
                                <th className="table-th">Name</th>
                                <th className="table-th">Email</th>
                                <th className="table-th">Department</th>
                                <th className="table-th">Attendance</th>
                                <th className="table-th">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrations.map((reg, i) => (
                                <tr key={reg._id} className="table-row">
                                    <td className="table-cell text-slate-500">{i + 1}</td>
                                    <td className="table-cell-bold">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                                {(reg.user?.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            {reg.user?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="table-cell">{reg.user?.email || 'N/A'}</td>
                                    <td className="table-cell">{reg.user?.department || '—'}</td>
                                    <td className="table-cell">
                                        {reg.attendance ? (
                                            <span className="badge-success flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Present
                                            </span>
                                        ) : (
                                            <span className="badge-error flex items-center gap-1">
                                                <XCircle className="w-3 h-3" /> Absent
                                            </span>
                                        )}
                                    </td>
                                    <td className="table-cell">
                                        <button
                                            onClick={() => toggleAttendance(reg._id, reg.attendance)}
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 ${reg.attendance
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                }`}
                                        >
                                            {reg.attendance ? 'Mark Absent' : 'Mark Present'}
                                        </button>
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

export default EventRegistrationsPage;
