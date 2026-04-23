import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="text-white text-center mt-20">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard if role doesn't match
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'faculty') return <Navigate to="/student/dashboard" replace />;
        return <Navigate to="/events" replace />;
    }

    // Additional check for faculty approval
    if (user.role === 'faculty' && user.isApproved === false && allowedRoles && allowedRoles.includes('faculty') && !allowedRoles.includes('student')) {
        return <Navigate to="/student/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
