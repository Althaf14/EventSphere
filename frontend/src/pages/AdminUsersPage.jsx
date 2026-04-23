import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    Users, Search, ShieldCheck, ShieldOff, Trash2,
    Loader2, ArrowLeft, UserCog
} from 'lucide-react';

const ROLES = ['all', 'student', 'coordinator', 'faculty', 'admin'];

const roleBadge = (role) => {
    const map = {
        admin: 'badge-error',
        faculty: 'badge-warning',
        coordinator: 'badge-info',
        student: 'badge-success',
    };
    return map[role] || 'badge-gray';
};

const AdminUsersPage = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (roleFilter !== 'all') params.role = roleFilter;
            if (search.trim()) params.search = search.trim();
            const { data } = await api.get('/admin/users', { params });
            setUsers(data);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleRoleChange = async (userId, newRole) => {
        setActionLoadingId(userId + '-role');
        try {
            const { data } = await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: data.role } : u));
            toast.success('Role updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update role');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleToggleStatus = async (userId) => {
        setActionLoadingId(userId + '-status');
        try {
            const { data } = await api.put(`/admin/users/${userId}/toggle-status`);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: data.isActive } : u));
            toast.success(data.isActive ? 'User activated' : 'User suspended');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = async (userId) => {
        setActionLoadingId(userId + '-del');
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u._id !== userId));
            toast.success('User deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setActionLoadingId(null);
            setConfirmDelete(null);
        }
    };

    const handleApprove = async (userId) => {
        setActionLoadingId(userId + '-approve');
        try {
            await api.put(`/admin/users/${userId}/approve`);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isApproved: true } : u));
            toast.success('User approved');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve user');
        } finally {
            setActionLoadingId(null);
        }
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
                    <h1 className="page-heading mb-0">Manage Users</h1>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="form-input pl-9"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="form-select w-full sm:w-44"
                    >
                        {ROLES.map(r => (
                            <option key={r} value={r}>{r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                    </select>
                    <button type="submit" className="btn-primary whitespace-nowrap">
                        <Search className="w-4 h-4" /> Search
                    </button>
                </form>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
                </div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><Users className="w-8 h-8" /></div>
                    <p className="text-slate-400">No users found.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="w-full">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-th">Name / Email</th>
                                <th className="table-th">Role</th>
                                <th className="table-th">Department</th>
                                <th className="table-th">Status</th>
                                <th className="table-th">Joined</th>
                                <th className="table-th">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => {
                                const isSelf = u._id === currentUser?._id;
                                return (
                                    <tr key={u._id} className="table-row">
                                        <td className="table-cell-bold">
                                            <div>{u.name}</div>
                                            <div className="text-xs text-slate-400 font-normal">{u.email}</div>
                                        </td>
                                        <td className="table-cell">
                                            <select
                                                value={u.role}
                                                onChange={e => handleRoleChange(u._id, e.target.value)}
                                                disabled={isSelf || actionLoadingId === u._id + '-role'}
                                                className="form-select py-1.5 text-xs w-36"
                                            >
                                                {['student', 'coordinator', 'faculty', 'admin'].map(r => (
                                                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="table-cell">{u.department || '—'}</td>
                                        <td className="table-cell">
                                            <div className="flex flex-col gap-1">
                                                <span className={u.isActive !== false ? 'badge-success w-fit' : 'badge-error w-fit'}>
                                                    {u.isActive !== false ? 'Active' : 'Suspended'}
                                                </span>
                                                {u.isApproved === false && (
                                                    <span className="badge-warning w-fit">Pending Approval</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="table-cell text-xs">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-2">
                                                {!isSelf && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleStatus(u._id)}
                                                            disabled={!!actionLoadingId}
                                                            title={u.isActive !== false ? 'Suspend' : 'Activate'}
                                                            className={u.isActive !== false ? 'btn-warning btn-xs' : 'btn-success btn-xs'}
                                                        >
                                                            {actionLoadingId === u._id + '-status'
                                                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                                                : u.isActive !== false
                                                                    ? <ShieldOff className="w-3 h-3" />
                                                                    : <ShieldCheck className="w-3 h-3" />
                                                            }
                                                            {u.isActive !== false ? 'Suspend' : 'Activate'}
                                                        </button>
                                                        {u.isApproved === false && (
                                                            <button
                                                                onClick={() => handleApprove(u._id)}
                                                                disabled={!!actionLoadingId}
                                                                title="Approve user"
                                                                className="btn-success btn-xs"
                                                            >
                                                                {actionLoadingId === u._id + '-approve'
                                                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                                                    : <ShieldCheck className="w-3 h-3" />
                                                                }
                                                                Approve
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setConfirmDelete(u)}
                                                            disabled={!!actionLoadingId}
                                                            title="Delete user"
                                                            className="btn-danger btn-xs"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> Delete
                                                        </button>
                                                    </>
                                                )}
                                                {isSelf && <span className="text-xs text-slate-500 italic">You</span>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="card max-w-md w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-accent-400" />
                            </div>
                            <h3 className="card-title">Delete User</h3>
                        </div>
                        <p className="text-slate-300 text-sm mb-6">
                            Are you sure you want to delete <strong className="text-white">{confirmDelete.name}</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="btn-secondary btn-sm">Cancel</button>
                            <button
                                onClick={() => handleDelete(confirmDelete._id)}
                                disabled={!!actionLoadingId}
                                className="btn-danger btn-sm"
                            >
                                {actionLoadingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
