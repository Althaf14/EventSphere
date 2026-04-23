import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    Camera, Loader2, Save, X, User, Mail,
    Phone, Building2, BookMarked, Users,
    Award, Calendar, ArrowRight, PencilLine,
    ShieldCheck, BookOpen, ClipboardList, GraduationCap,
    LayoutGrid, CheckCircle2, FileText
} from 'lucide-react';

/* ── Role helpers ─────────────────────────────────────────── */
const ROLE_META = {
    admin: { Icon: ShieldCheck, color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30', label: 'Administrator' },
    faculty: { Icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', label: 'Faculty' },
    coordinator: { Icon: ClipboardList, color: 'text-sky-400', bg: 'bg-sky-500/15', border: 'border-sky-500/30', label: 'Coordinator' },
    student: { Icon: GraduationCap, color: 'text-brand-400', bg: 'bg-brand-500/15', border: 'border-brand-500/30', label: 'Student' },
};
const getRole = (role) => ROLE_META[role] || { Icon: User, color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30', label: role };

/* ── Info tile ─────────────────────────────────────────────── */
const InfoTile = ({ icon: Icon, iconColor, label, value, placeholder }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface-700/30 border border-white/[0.05]">
        <div className={`mt-0.5 p-2 rounded-xl bg-surface-700/60 ${iconColor}`}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
            <p className={`text-sm font-medium leading-relaxed break-words ${value ? 'text-white' : 'text-slate-500 italic'}`}>
                {value || placeholder}
            </p>
        </div>
    </div>
);

/* ── Stat pill ─────────────────────────────────────────────── */
const StatPill = ({ icon: Icon, color, bg, value, label }) => (
    <div className="flex-1 flex flex-col items-center justify-center gap-1.5 py-5 px-3">
        <div className={`${bg} rounded-xl p-2.5 mb-0.5`}>
            <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="font-display text-3xl font-extrabold text-white leading-none">{value}</span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
);

/* ════════════════════════════════════════════════════════════ */
const ProfilePage = () => {
    const { user: authUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [stats, setStats] = useState({ registered: 0, attended: 0, certificates: 0 });
    const [formData, setFormData] = useState({ name: '', department: '', phone: '', bio: '' });
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchProfile(); fetchStats(); }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/profile/me');
            setProfile(data);
            setFormData({ name: data.name || '', department: data.department || '', phone: data.phone || '', bio: data.bio || '' });
        } catch { toast.error('Failed to load profile'); }
        finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try {
            const [regRes, attRes] = await Promise.all([api.get('/registrations/my'), api.get('/my-attendance')]);
            const attended = attRes.data?.filter(a => a.status === 'Present').length || 0;
            setStats({ registered: regRes.data?.length || 0, attended, certificates: attended });
        } catch { }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('image', file);
        setUploading(true);
        const t = toast.loading('Uploading…');
        try {
            const { data } = await api.post('/profile/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setProfile(prev => ({ ...prev, profileImage: data.profileImage }));
            toast.success('Photo updated!', { id: t });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed', { id: t });
        } finally { setUploading(false); }
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setSaving(true);
        const t = toast.loading('Saving…');
        try {
            const { data } = await api.put('/profile/me', formData);
            setProfile(data);
            setIsEditing(false);
            toast.success('Profile updated!', { id: t });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed', { id: t });
        } finally { setSaving(false); }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setFormData({ name: profile.name, department: profile.department || '', phone: profile.phone || '', bio: profile.bio || '' });
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
        </div>
    );

    const avatarSrc = profile.profileImage
        ? (profile.profileImage.startsWith('http') ? profile.profileImage : `http://localhost:5000${profile.profileImage}`)
        : null;
    const initials = (profile.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const role = getRole(profile.role);
    const RoleIcon = role.Icon;

    return (
        <div className="page-wrapper animate-fade-in-up max-w-5xl mx-auto">

            {/* ══ COVER + AVATAR HERO ════════════════════════════════ */}
            <div className="relative rounded-3xl overflow-hidden mb-6 shadow-card-lg">

                {/* Cover stripe */}
                <div className="h-52 w-full bg-gradient-to-br from-surface-700 via-brand-900/60 to-surface-800 relative">
                    {/* Decorative mesh */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-brand-500/20 blur-3xl -translate-x-1/3 -translate-y-1/3" />
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-teal-400/15 blur-3xl translate-x-1/4 -translate-y-1/4" />
                        <div className="absolute bottom-0 left-1/2 w-96 h-32 rounded-full bg-brand-600/10 blur-2xl -translate-x-1/2" />
                    </div>

                    {/* Edit button (top right of cover) */}
                    <div className="absolute top-4 right-4 z-10">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold transition-all"
                            >
                                <PencilLine className="w-3.5 h-3.5" />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={cancelEdit} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold transition-all">
                                    <X className="w-3.5 h-3.5" /> Cancel
                                </button>
                                <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-sm font-bold transition-all shadow-glow-sm">
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    {saving ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom white/glass panel */}
                <div className="bg-surface-800/95 backdrop-blur-sm px-8 pb-6">
                    {/* Avatar row - overlaps the cover */}
                    <div className="flex items-end gap-6 -mt-16 mb-5">
                        {/* Avatar */}
                        <div className="relative group flex-shrink-0 z-10">
                            <div className={`w-32 h-32 rounded-full ring-4 ring-surface-800 ring-offset-0 overflow-hidden shadow-xl border-2 ${role.border}`}>
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="Profile" className={`w-full h-full object-cover transition-opacity ${uploading ? 'opacity-40' : ''}`} />
                                ) : (
                                    <div className={`w-full h-full ${role.bg} flex items-center justify-center`}>
                                        <span className="font-display text-4xl font-extrabold text-white">{initials}</span>
                                    </div>
                                )}
                            </div>
                            {/* Always-visible camera button */}
                            <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-brand-500 hover:bg-brand-400 border-2 border-surface-800 flex items-center justify-center cursor-pointer shadow-lg transition-all active:scale-95">
                                {uploading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        </div>

                        {/* Name + Role */}
                        <div className="pb-1 flex-1 min-w-0">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-2 ${role.bg} ${role.color} border ${role.border}`}>
                                <RoleIcon className="w-3 h-3" />
                                {role.label}
                            </div>
                            <h1 className="font-display text-3xl font-extrabold text-white truncate">{profile.name}</h1>
                            {profile.department && (
                                <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {profile.department}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Stats strip ──────────────────────────────────── */}
                    {!isEditing && (
                        <div className="flex divide-x divide-white/[0.06] bg-surface-700/30 rounded-2xl border border-white/[0.05] overflow-hidden">
                            <StatPill icon={BookMarked} color="text-brand-400" bg="bg-brand-500/15" value={stats.registered} label="Registered" />
                            <StatPill icon={CheckCircle2} color="text-teal-400" bg="bg-teal-500/15" value={stats.attended} label="Attended" />
                            <StatPill icon={Award} color="text-accent-400" bg="bg-accent-500/15" value={stats.certificates} label="Certificates" />
                        </div>
                    )}
                </div>
            </div>

            {/* ══ MAIN CONTENT AREA ══════════════════════════════════════ */}
            {!isEditing ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Left — contact info */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="card-lg">
                            <h2 className="section-heading flex items-center gap-2 text-lg mb-5">
                                <User className="w-5 h-5 text-brand-400" />
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <InfoTile icon={Mail} iconColor="text-brand-400" label="Email Address" value={profile.email} placeholder="Not provided" />
                                <InfoTile icon={Phone} iconColor="text-teal-400" label="Phone Number" value={profile.phone} placeholder="Not provided" />
                                <InfoTile icon={Building2} iconColor="text-sky-400" label="Department" value={profile.department} placeholder="Not provided" />
                                <InfoTile icon={LayoutGrid} iconColor="text-violet-400" label="Role" value={role.label} placeholder="Unknown" />
                            </div>
                            <InfoTile icon={FileText} iconColor="text-slate-400" label="About Me" value={profile.bio} placeholder='No bio yet. Click "Edit Profile" to add one.' />
                        </div>
                    </div>

                    {/* Right — quick actions */}
                    <div className="space-y-4">
                        <div className="card-lg">
                            <h2 className="section-heading flex items-center gap-2 text-lg mb-5">
                                <LayoutGrid className="w-5 h-5 text-brand-400" />
                                Quick Actions
                            </h2>
                            <div className="space-y-2.5">
                                {[
                                    { label: 'My Registrations', icon: BookMarked, color: 'text-brand-400', bg: 'bg-brand-500/10', to: '/my-registrations' },
                                    { label: 'My Attendance', icon: Users, color: 'text-teal-400', bg: 'bg-teal-500/10', to: '/my-attendance' },
                                    { label: 'My Certificates', icon: Award, color: 'text-accent-400', bg: 'bg-accent-500/10', to: '/my-certificates' },
                                    { label: 'Browse Events', icon: Calendar, color: 'text-violet-400', bg: 'bg-violet-500/10', to: '/events' },
                                ].map(({ label, icon: Icon, color, bg, to }) => (
                                    <button
                                        key={label}
                                        onClick={() => navigate(to)}
                                        className="w-full group flex items-center gap-3 p-3.5 rounded-xl bg-surface-700/30 hover:bg-surface-700/60 border border-white/[0.04] hover:border-white/10 transition-all duration-200"
                                    >
                                        <div className={`${bg} rounded-xl p-2.5 flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 ${color}`} />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors flex-1 text-left">{label}</span>
                                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Account info mini-card */}
                        <div className="card p-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Account</p>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Status</span>
                                    <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                        Active
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Member since</span>
                                    <span className="text-white font-medium">
                                        {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            ) : (
                /* ══ EDIT PANEL ══════════════════════════════════════════ */
                <div className="card-lg animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-7">
                        <div className="p-2.5 bg-brand-500/15 rounded-xl">
                            <PencilLine className="w-5 h-5 text-brand-400" />
                        </div>
                        <div>
                            <h2 className="font-display text-xl font-bold text-white">Edit Profile</h2>
                            <p className="text-slate-400 text-sm">Update your personal details</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="form-label">Full Name</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500">
                                    <User className="w-4 h-4" />
                                </span>
                                <input
                                    type="text" name="name" required
                                    value={formData.name} onChange={handleChange}
                                    className="form-input pl-10" disabled={saving}
                                    placeholder="Your full name"
                                />
                            </div>
                        </div>

                        {/* Department + Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Department</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500">
                                        <Building2 className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="text" name="department"
                                        value={formData.department} onChange={handleChange}
                                        className="form-input pl-10" disabled={saving}
                                        placeholder="e.g. Computer Science"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Phone Number</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500">
                                        <Phone className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="text" name="phone"
                                        value={formData.phone} onChange={handleChange}
                                        className="form-input pl-10" disabled={saving}
                                        placeholder="e.g. 9876543210"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="form-label">
                                Bio <span className="text-slate-500 font-normal">(max 200 chars)</span>
                            </label>
                            <textarea
                                name="bio" maxLength={200} rows={4}
                                value={formData.bio} onChange={handleChange}
                                className="form-input resize-none" disabled={saving}
                                placeholder="Tell your college peers a bit about yourself…"
                            />
                            <p className="text-right text-xs text-slate-500 mt-1.5">{formData.bio.length}/200</p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
                            <button type="button" onClick={cancelEdit} disabled={saving} className="btn-secondary">
                                <X className="w-4 h-4" /> Cancel
                            </button>
                            <button type="submit" disabled={saving} className="btn-primary-lg">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Saving Changes…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
