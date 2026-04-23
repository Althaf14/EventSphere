import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart2, Loader2, Users, TrendingUp, Building2 } from 'lucide-react';
import ExportBtn from '../components/ExportBtn';

const ReportsDashboard = () => {
    const [participationStats, setParticipationStats] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState([]);
    const [departmentStats, setDepartmentStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([
            api.get('/reports/event-summary'),
            api.get('/reports/attendance-summary'),
            api.get('/reports/department-summary'),
        ]).then(([pRes, aRes, dRes]) => {
            setParticipationStats(pRes.data);
            setAttendanceStats(aRes.data);
            setDepartmentStats(dRes.data);
        }).catch(() => setError('Failed to fetch report data'))
            .finally(() => setLoading(false));
    }, []);

    const maxDept = departmentStats.length > 0 ? Math.max(...departmentStats.map(s => s.value)) : 1;

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
    );

    return (
        <div className="page-wrapper animate-fade-in-up">
            {/* Header */}
            <div className="mb-10">
                <div className="section-tag"><BarChart2 className="w-3.5 h-3.5" /> Analytics</div>
                <h1 className="page-heading mb-1">Reports &amp; Analytics</h1>
                <p className="text-slate-400 text-sm">Insights into event participation, attendance, and department engagement.</p>
            </div>

            {error && <div className="alert-error mb-6">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Event Participation */}
                <div className="card">
                    <div className="flex items-center justify-between card-header">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-brand-400" />
                            <h2 className="card-title">Event Participation</h2>
                        </div>
                        <div className="flex gap-2">
                            <ExportBtn url="/reports/export?type=participation&format=pdf" label="PDF" type="pdf" />
                            <ExportBtn url="/reports/export?type=participation&format=excel" label="Excel" type="excel" />
                        </div>
                    </div>
                    {participationStats.length === 0 ? (
                        <p className="text-center text-slate-500 py-6 text-sm">No data available</p>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="table-header-row">
                                    <th className="table-th text-xs">Event Name</th>
                                    <th className="table-th-center text-xs">Regs</th>
                                    <th className="table-th-right text-xs">Full List</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participationStats.map((stat, i) => (
                                    <tr key={i} className="table-row">
                                        <td className="table-cell truncate max-w-[150px]">{stat.label}</td>
                                        <td className="table-cell-center font-bold text-brand-400">{stat.value}</td>
                                        <td className="table-cell text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <ExportBtn
                                                    url={`/reports/export?type=event-registrations&format=pdf&eventId=${stat.eventId}`}
                                                    label="PDF"
                                                    type="pdf"
                                                />
                                                <ExportBtn
                                                    url={`/reports/export?type=event-registrations&format=excel&eventId=${stat.eventId}`}
                                                    label="XLS"
                                                    type="excel"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Department Distribution */}
                <div className="card">
                    <div className="flex items-center justify-between card-header">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-emerald-400" />
                            <h2 className="card-title">Department Participation</h2>
                        </div>
                        <div className="flex gap-2">
                            <ExportBtn url="/reports/export?type=department&format=pdf" label="PDF" type="pdf" />
                            <ExportBtn url="/reports/export?type=department&format=excel" label="Excel" type="excel" />
                        </div>
                    </div>
                    {departmentStats.length === 0 ? (
                        <p className="text-center text-slate-500 py-6 text-sm">No data available</p>
                    ) : (
                        <div className="space-y-4">
                            {departmentStats.map((stat, i) => {
                                const pct = Math.round((stat.value / maxDept) * 100);
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-slate-300 font-medium">{stat.label}</span>
                                            <span className="text-emerald-400 font-bold">{stat.value} students</span>
                                        </div>
                                        <div className="progress-track">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-brand-500 transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Attendance Health – full width */}
                <div className="card lg:col-span-2">
                    <div className="flex items-center justify-between card-header">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-violet-400" />
                            <h2 className="card-title">Attendance Health</h2>
                            <span className="text-slate-500 text-xs font-normal">(Present vs Registered)</span>
                        </div>
                        <div className="flex gap-2">
                            <ExportBtn url="/reports/export?type=attendance&format=pdf" label="PDF" type="pdf" />
                            <ExportBtn url="/reports/export?type=attendance&format=excel" label="Excel" type="excel" />
                        </div>
                    </div>
                    {attendanceStats.length === 0 ? (
                        <p className="text-center text-slate-500 py-6 text-sm">No data available</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {attendanceStats.map((stat, i) => {
                                const pct = stat.percentage || 0;
                                const color =
                                    pct >= 75 ? 'from-emerald-500 to-brand-500' :
                                        pct >= 50 ? 'from-amber-500 to-orange-500' :
                                            'from-red-500 to-rose-500';
                                const textColor =
                                    pct >= 75 ? 'text-emerald-400' :
                                        pct >= 50 ? 'text-amber-400' :
                                            'text-red-400';
                                return (
                                    <div key={i} className="bg-surface-700/50 rounded-xl p-6 border border-white/[0.06] flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-sm font-semibold text-white truncate max-w-[150px]">{stat.label}</h3>
                                                <div className="flex gap-1.5">
                                                    <ExportBtn
                                                        url={`/reports/export?type=event-registrations&format=pdf&eventId=${stat.eventId}`}
                                                        label="PDF"
                                                        type="pdf"
                                                    />
                                                    <ExportBtn
                                                        url={`/reports/export?type=event-registrations&format=excel&eventId=${stat.eventId}`}
                                                        label="XLS"
                                                        type="excel"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-baseline mb-2">
                                                <span className="text-slate-400 text-xs">Attendance Rate</span>
                                                <span className={`text-2xl font-extrabold font-display ${textColor}`}>{pct}%</span>
                                            </div>
                                            <div className="progress-track mb-3">
                                                <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-[11px] text-slate-500">
                                            <span>Registered: <span className="text-slate-300 font-semibold">{stat.registered}</span></span>
                                            <span>Present: <span className="text-slate-300 font-semibold">{stat.present}</span></span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsDashboard;
