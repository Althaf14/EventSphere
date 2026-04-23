import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyDashboard from '../components/FacultyDashboard';
import AdminDashboard from '../components/AdminDashboard';
import CoordinatorDashboard from '../components/CoordinatorDashboard';
import StudentDashboard from '../components/StudentDashboard';
import { Loader2, ShieldCheck, BookOpen, ClipboardList, GraduationCap, User } from 'lucide-react';

const RoleIcon = ({ role, className = 'w-3.5 h-3.5' }) => {
    const icons = {
        admin: <ShieldCheck className={className} />,
        faculty: <BookOpen className={className} />,
        coordinator: <ClipboardList className={className} />,
        student: <GraduationCap className={className} />,
    };
    return icons[role] || <User className={className} />;
};

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) setUser(JSON.parse(userInfo));
        else navigate('/login');
    }, [navigate]);

    if (!user) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
    );

    return (
        <div className="page-wrapper animate-fade-in-up">
            {/* Page Header */}
            <div className="mb-10">
                <div className="section-tag">
                    <RoleIcon role={user.role} />
                    <span className="capitalize">{user.role} Dashboard</span>
                </div>
                <h1 className="page-heading mb-1">Welcome back, <span className="bg-gradient-to-r from-brand-300 to-teal-300 bg-clip-text text-transparent">{user.name}</span></h1>
                <p className="text-slate-400 text-sm">Here's what's happening with your events today.</p>
            </div>

            {/* Role-Specific Dashboards */}
            {user.role === 'admin' && <AdminDashboard />}
            {(user.role === 'faculty' || user.role === 'coordinator') && <CoordinatorDashboard />}
            {user.role === 'student' && <StudentDashboard />}

            {/* Organizer (legacy) */}
            {user.role === 'organizer' && (
                <div className="card">
                    <h2 className="section-heading">Organizer Panel</h2>
                    <button onClick={() => navigate('/events/create')} className="btn-primary">
                        Create New Event
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
