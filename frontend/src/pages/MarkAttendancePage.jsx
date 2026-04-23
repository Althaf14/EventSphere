import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck, Loader2, CheckCircle, XCircle, Save, User as UserIcon, Mail } from 'lucide-react';

const MarkAttendancePage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        api.get('/events/my')
            .then(({ data }) => {
                setEvents(data);
                // Check for eventId in query params
                const params = new URLSearchParams(location.search);
                const eventId = params.get('eventId');
                if (eventId && data.some(e => e._id === eventId)) {
                    setSelectedEventId(eventId);
                }
            })
            .catch(() => setError('Failed to load events'));
    }, [location.search]);

    useEffect(() => {
        if (!selectedEventId) { setStudents([]); return; }
        setLoading(true);
        setError('');
        setSuccessMessage('');
        api.get(`/events/${selectedEventId}/attendance`)
            .then(({ data }) => setStudents(data))
            .catch((err) => { setError(err.response?.data?.message || 'Failed to fetch student list'); setStudents([]); })
            .finally(() => setLoading(false));
    }, [selectedEventId]);

    const handleToggleStatus = (studentId) => {
        setStudents(students.map(s => {
            if (s.studentId === studentId) {
                const nextStatus = s.status === 'Present' ? 'Absent' : 'Present';
                return { ...s, status: nextStatus };
            }
            return s;
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const attendanceData = students.map(s => ({
                studentId: s.studentId,
                status: s.status === 'Not Marked' ? 'Absent' : s.status,
            }));
            await api.post(`/events/${selectedEventId}/attendance`, { attendance: attendanceData });
            setSuccessMessage('Attendance saved successfully!');
            const { data } = await api.get(`/events/${selectedEventId}/attendance`);
            setStudents(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit attendance');
        } finally {
            setLoading(false);
        }
    };

    const presentCount = students.filter(s => s.status === 'Present').length;

    return (
        <div className="page-wrapper animate-fade-in-up">
            {/* Header */}
            <div className="mb-10">
                <div className="section-tag"><ClipboardCheck className="w-3.5 h-3.5" /> Attendance Management</div>
                <h1 className="page-heading mb-1">Mark Attendance</h1>
                <p className="text-slate-400 text-sm">Select an event and mark student attendance.</p>
            </div>

            {/* Event Selector */}
            <div className="card mb-6">
                <label className="form-label">Select Event</label>
                <div className="relative">
                    <select
                        id="attendance-event-select"
                        className="form-select"
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                        <option value="">— Choose an Event —</option>
                        {events.map(event => (
                            <option key={event._id} value={event._id}>
                                {event.title} ({new Date(event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })})
                            </option>
                        ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </span>
                </div>
            </div>

            {error && <div className="alert-error mb-5">{error}</div>}
            {successMessage && <div className="alert-success mb-5"><CheckCircle className="w-4 h-4 flex-shrink-0" />{successMessage}</div>}

            {selectedEventId && (
                loading && students.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                    </div>
                ) : students.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><ClipboardCheck className="w-9 h-9" /></div>
                        <h2 className="font-display text-xl font-bold text-white mb-2">No Students Registered</h2>
                        <p className="text-slate-400 text-sm">No students have registered for this event yet.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        {/* Table Header Bar */}
                        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <h2 className="font-semibold text-white">
                                    Registered Students ({students.length})
                                </h2>
                                <span className="badge-success">{presentCount} Present</span>
                                <span className="badge-error">{students.length - presentCount} Absent</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {loading ? 'Saving…' : 'Save Attendance'}
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="table-header-row">
                                        <th className="table-th w-12 text-center">#</th>
                                        <th className="table-th">Name</th>
                                        <th className="table-th">Email</th>
                                        <th className="table-th">Department</th>
                                        <th className="table-th">Attendance</th>
                                        <th className="table-th text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, index) => (
                                        <tr key={student.studentId} className="table-row">
                                            <td className="table-cell-center text-xs font-mono text-slate-500">
                                                {index + 1}
                                            </td>
                                            <td className="table-cell-bold">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-glow-sm">
                                                        {(student.name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    {student.name}
                                                </div>
                                            </td>
                                            <td className="table-cell text-xs text-slate-400">
                                                {student.email || '—'}
                                            </td>
                                            <td className="table-cell">{student.department || '—'}</td>
                                            <td className="table-cell">
                                                <div className="flex">
                                                    {student.status === 'Present' ? (
                                                        <span className="badge-success flex items-center gap-1 px-3 py-1 bg-teal-500/10 border-teal-500/20 text-[11px] rounded-full">
                                                            <CheckCircle className="w-3 h-3" /> Present
                                                        </span>
                                                    ) : student.status === 'Absent' ? (
                                                        <span className="badge-error flex items-center gap-1 px-3 py-1 bg-accent-500/10 border-accent-500/20 text-[11px] rounded-full">
                                                            <XCircle className="w-3 h-3" /> Absent
                                                        </span>
                                                    ) : (
                                                        <span className="badge-gray px-3 py-1 bg-slate-500/10 border-slate-500/20 text-[11px] rounded-full">Not Marked</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="table-cell text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(student.studentId)}
                                                    className={`btn btn-xs min-w-[100px] transition-all
                                                        ${student.status === 'Present' 
                                                            ? 'btn-warning bg-amber-500/10 hover:bg-amber-500/20 text-amber-500' 
                                                            : 'btn-success bg-brand-500/10 hover:bg-brand-500/20 text-brand-400'}`}
                                                >
                                                    {student.status === 'Present' ? 'Mark Absent' : 'Mark Present'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default MarkAttendancePage;
