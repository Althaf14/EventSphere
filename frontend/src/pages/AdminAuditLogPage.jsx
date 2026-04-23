import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ClipboardList, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const ACTION_TYPES = [
    'all',
    'USER_ROLE_CHANGED',
    'USER_SUSPENDED',
    'USER_ACTIVATED',
    'USER_DELETED',
    'USER_CREATED',
];

const actionBadge = (action) => {
    const map = {
        USER_ROLE_CHANGED: 'badge-info',
        USER_SUSPENDED: 'badge-error',
        USER_ACTIVATED: 'badge-success',
        USER_DELETED: 'badge-error',
        USER_CREATED: 'badge-success',
    };
    return map[action] || 'badge-gray';
};

const actionLabel = (action) => action.replace(/_/g, ' ');

const AdminAuditLogPage = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchLogs = async (currentPage = 1) => {
        setLoading(true);
        try {
            const params = { page: currentPage, limit: 15 };
            if (actionFilter !== 'all') params.action = actionFilter;
            const { data } = await api.get('/admin/audit-logs', { params });
            setLogs(data.logs);
            setTotalPages(data.pages);
            setTotal(data.total);
        } catch {
            // silently fail — keep existing logs
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchLogs(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actionFilter]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchLogs(newPage);
    };

    return (
        <div className="page-wrapper animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/admin/dashboard')} className="btn-ghost p-2">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <p className="label-tag">Admin Panel</p>
                    <h1 className="page-heading mb-0">Audit Log</h1>
                </div>
                <span className="ml-auto badge-gray">{total} entries</span>
            </div>

            {/* Filter */}
            <div className="card mb-6">
                <div className="flex flex-wrap gap-2">
                    {ACTION_TYPES.map(a => (
                        <button
                            key={a}
                            onClick={() => setActionFilter(a)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border
                                ${actionFilter === a
                                    ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                                    : 'border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
                                }`}
                        >
                            {a === 'all' ? 'All Actions' : actionLabel(a)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Log Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
                </div>
            ) : logs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><ClipboardList className="w-8 h-8" /></div>
                    <p className="text-slate-400">No audit logs found.</p>
                </div>
            ) : (
                <>
                    <div className="table-container mb-6">
                        <table className="w-full">
                            <thead>
                                <tr className="table-header-row">
                                    <th className="table-th">Timestamp</th>
                                    <th className="table-th">Action</th>
                                    <th className="table-th">Performed By</th>
                                    <th className="table-th">Target User</th>
                                    <th className="table-th">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log._id} className="table-row">
                                        <td className="table-cell text-xs whitespace-nowrap">
                                            <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                                            <div className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="table-cell">
                                            <span className={actionBadge(log.action)}>
                                                {actionLabel(log.action)}
                                            </span>
                                        </td>
                                        <td className="table-cell-bold">
                                            <div>{log.performedBy?.name || '—'}</div>
                                            <div className="text-xs text-slate-400 font-normal">{log.performedBy?.email}</div>
                                        </td>
                                        <td className="table-cell">
                                            {log.targetUser ? (
                                                <>
                                                    <div className="font-semibold text-white text-sm">{log.targetUser.name}</div>
                                                    <div className="text-xs text-slate-400">{log.targetUser.email}</div>
                                                </>
                                            ) : '—'}
                                        </td>
                                        <td className="table-cell text-xs text-slate-400 max-w-xs">
                                            {log.details}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                                className="btn-secondary btn-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages}
                                className="btn-secondary btn-sm"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminAuditLogPage;
