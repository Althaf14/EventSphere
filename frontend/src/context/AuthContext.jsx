import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        const token = localStorage.getItem('token');

        if (userInfo && token) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            setUser(data);

            // Redirect based on role
            // Redirect based on role
            // Redirect based on role and approval status
            if (data.role === 'admin') navigate('/admin/dashboard');
            else if ((data.role === 'faculty' || data.role === 'coordinator') && data.isApproved !== false) navigate('/coordinator/dashboard');
            else if (data.role === 'student' || (data.role === 'faculty' && data.isApproved === false)) navigate('/student/dashboard');
            else navigate('/dashboard');

            return { success: true };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            setUser(data);

            // Redirect based on role
            // Redirect based on role
            // Redirect based on role and approval status
            if (data.role === 'admin') navigate('/admin/dashboard');
            else if ((data.role === 'faculty' || data.role === 'coordinator') && data.isApproved !== false) navigate('/coordinator/dashboard');
            else if (data.role === 'student') navigate('/student/dashboard');
            else if (data.role === 'faculty' && data.isApproved === false) {
                // Do not navigate immediately, let the RegisterPage show the modal or wait for user action
            } else navigate('/dashboard');

            return { success: true };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
