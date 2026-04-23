import { useEffect, useState } from 'react';
import api from '../api/axios';
import { ClipboardCheck, Calendar, MapPin, Download, Award, Loader2 } from 'lucide-react';

const MyAttendancePage = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/my-attendance')
            .then(({ data }) => setAttendance(data))
            .catch((err) => setError(err.response?.data?.message || 'Failed to fetch attendance records'))
            .finally(() => setLoading(false));
    }, []);

    const handleDownloadCertificate = async (eventId, eventTitle) => {
        try {
            const response = await api.get(`/events/${eventId}/certificate`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate-${eventTitle.replace(/ /g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch {
            alert('Failed to download certificate. Please try again.');
        }
    };

    const presentCount = attendance.filter(r => r.status === 'Present').length;

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
    );

    return (
        <div className="page-wrapper animate-fade-in-up">
            {/* Header */}
            <div className="mb-10">
                <div className="section-tag"><ClipboardCheck className="w-3.5 h-3.5" /> Attendance</div>
                <h1 className="page-heading mb-1">My Attendance History</h1>
                <p className="text-slate-400 text-sm">Track your event attendance and download participation certificates.</p>
            </div>

            {error && <div className="alert-error mb-6">{error}</div>}

            {/* Summary */}
            {attendance.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <div className="stat-card">
                        <div className="stat-card-icon bg-brand-500/20">
                            <ClipboardCheck className="w-5 h-5 text-brand-400" />
                        </div>
                        <div>
                            <p className="stat-card-label">Total Events</p>
                            <p className="stat-card-value">{attendance.length}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon bg-emerald-500/20">
                            <Award className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="stat-card-label">Present</p>
                            <p className="stat-card-value">{presentCount}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon bg-red-500/20">
                            <Calendar className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="stat-card-label">Absent</p>
                            <p className="stat-card-value">{attendance.length - presentCount}</p>
                        </div>
                    </div>
                </div>
            )}

            {attendance.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><ClipboardCheck className="w-9 h-9" /></div>
                    <h2 className="font-display text-2xl font-bold text-white mb-2">No Attendance Records</h2>
                    <p className="text-slate-400 text-sm">You have no marked attendance records yet.</p>
                </div>
            ) : (
                <div className="table-container overflow-x-auto">
                    <table className="w-full min-w-[680px]">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-th">Event</th>
                                <th className="table-th">Date</th>
                                <th className="table-th">Venue</th>
                                <th className="table-th">Status</th>
                                <th className="table-th">Certificate</th>
                                <th className="table-th">Marked On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.map((record) => (
                                <tr key={record._id} className="table-row">
                                    <td className="table-cell-bold">{record.event?.title || 'Unknown Event'}</td>
                                    <td className="table-cell">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                            {record.event?.eventDate ? new Date(record.event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                                            {record.event?.venue || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <span className={record.status === 'Present' ? 'badge-success' : 'badge-error'}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        {record.status === 'Present' ? (
                                            <button
                                                onClick={() => handleDownloadCertificate(record.event._id, record.event.title)}
                                                className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold text-xs transition-colors"
                                            >
                                                <Download className="w-3.5 h-3.5" /> Download
                                            </button>
                                        ) : (
                                            <span className="text-slate-500 text-xs italic">Not eligible</span>
                                        )}
                                    </td>
                                    <td className="table-cell text-slate-500 text-xs">
                                        {new Date(record.markedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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

export default MyAttendancePage;
