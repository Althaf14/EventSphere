import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    Users, ShieldCheck, Loader2, ArrowLeft, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const PendingUsersPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToReject, setUserToReject] = useState(null);

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/pending-users');
            setUsers(data);
        } catch {
            toast.error('Failed to load pending users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApprove = async (userId) => {
        setActionLoadingId(userId);
        try {
            await api.put(`/admin/users/${userId}/approve`);
            setUsers(prev => prev.filter(u => u._id !== userId));
            toast.success('User approved successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve user');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleRejectClick = (user) => {
        setUserToReject(user);
        setShowConfirmModal(true);
    };

    const handleReject = async () => {
        if (!userToReject) return;
        const userId = userToReject._id;
        
        setActionLoadingId(userId);
        setShowConfirmModal(false);
        try {
            await api.delete(`/admin/users/${userId}/reject`);
            setUsers(prev => prev.filter(u => u._id !== userId));
            toast.success('Registration request rejected');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject request');
        } finally {
            setActionLoadingId(null);
            setUserToReject(null);
        }
    };

    return (
        <div className="page-wrapper animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="btn-ghost p-2">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <p className="label-tag">Management</p>
                    <h1 className="page-heading mb-0">Pending Approvals</h1>
                    <p className="text-slate-400 text-sm mt-1">Review and approve new faculty member accounts.</p>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
                </div>
            ) : users.length === 0 ? (
                <div className="card py-16 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
                    <p className="text-slate-400 max-w-xs">There are no pending faculty registrations to review at this time.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="w-full">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-th">Name / Email</th>
                                <th className="table-th">Department</th>
                                <th className="table-th">Role</th>
                                <th className="table-th">Joined</th>
                                <th className="table-th-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id} className="table-row">
                                    <td className="table-cell-bold">
                                        <div>{u.name}</div>
                                        <div className="text-xs text-slate-400 font-normal">{u.email}</div>
                                    </td>
                                    <td className="table-cell">{u.department || '—'}</td>
                                    <td className="table-cell">
                                        <span className="badge-warning">Faculty</span>
                                    </td>
                                    <td className="table-cell text-xs">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="table-cell text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleApprove(u._id)}
                                                disabled={!!actionLoadingId}
                                                className="btn-success btn-xs"
                                            >
                                                {actionLoadingId === u._id
                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    : <ShieldCheck className="w-3.5 h-3.5" />
                                                }
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectClick(u)}
                                                disabled={!!actionLoadingId}
                                                className="btn-danger btn-xs"
                                            >
                                                {actionLoadingId === u._id
                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    : <XCircle className="w-3.5 h-3.5" />
                                                }
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/90 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface-800 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-glow-sm animate-scale-in">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 mx-auto">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white text-center mb-3">Reject Request?</h3>
                        <p className="text-slate-400 text-center text-sm leading-relaxed mb-8">
                            Are you sure you want to reject the registration request for <span className="text-white font-semibold">{userToReject?.name}</span>?
                            <br /><br />
                            This action will permanently delete their account and cannot be undone.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleReject}
                                className="btn-danger w-full justify-center !py-3"
                            >
                                Confirm Rejection
                            </button>
                            <button
                                onClick={() => { setShowConfirmModal(false); setUserToReject(null); }}
                                className="btn-secondary w-full justify-center !py-3"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingUsersPage;
