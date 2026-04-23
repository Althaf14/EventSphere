import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Shield, BookOpen, Zap, ArrowRight, AlertCircle, GraduationCap, ClipboardList, ShieldCheck } from 'lucide-react';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student');
    const [department, setDepartment] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const { user, register } = useAuth();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
 
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        if (!passwordRegex.test(password)) {
            setError('Password must contain at least one special character');
            return;
        }
        setIsLoading(true);
        const result = await register({ name, email, password, role, department });
        if (result.success) {
            if (role === 'faculty') {
                setShowSuccessModal(true);
            }
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    const roleOptions = [
        { value: 'student', label: 'Student', Icon: GraduationCap },
        { value: 'faculty', label: 'Faculty', Icon: BookOpen },
    ];

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-violet-600/7 blur-3xl" />
            </div>

            <div className="w-full max-w-lg animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-6 p-2 rounded-2xl bg-brand-500/10 border border-brand-500/20">
                        <Zap className="w-5 h-5 text-brand-400" />
                        <span className="text-brand-400 text-sm font-semibold">Event Sphere</span>
                    </div>
                    <h1 className="font-display text-4xl font-extrabold text-white mb-2">Create your account</h1>
                    <p className="text-slate-400 text-sm">Join your college event community</p>
                </div>

                <div className="card-lg">
                    {error && (
                        <div className="alert-error mb-6">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="form-label">Full Name</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className="w-4 h-4 text-slate-500" />
                                </span>
                                <input
                                    id="reg-name"
                                    type="text"
                                    className="form-input pl-10"
                                    placeholder="Your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="form-label">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                </span>
                                <input
                                    id="reg-email"
                                    type="email"
                                    className="form-input pl-10"
                                    placeholder="college@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="form-label">Department <span className="text-slate-500 font-normal">(optional)</span></label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <BookOpen className="w-4 h-4 text-slate-500" />
                                </span>
                                <input
                                    id="reg-department"
                                    type="text"
                                    className="form-input pl-10"
                                    placeholder="e.g. Computer Science"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="form-label">Role</label>
                            <div className="grid grid-cols-4 gap-2">
                                {roleOptions.map(({ value, label, Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setRole(value)}
                                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all duration-200
                                            ${role === value
                                                ? 'bg-brand-500/15 border-brand-500/40 text-brand-300'
                                                : 'bg-surface-700/40 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${role === value ? 'text-brand-400' : 'text-slate-500'}`} />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Password</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="w-4 h-4 text-slate-500" />
                                    </span>
                                    <input
                                        id="reg-password"
                                        type="password"
                                        className="form-input pl-10"
                                        placeholder="Min. 6 chars + special"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1 ml-1">Must include a special character</p>
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Confirm Password</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Shield className="w-4 h-4 text-slate-500" />
                                    </span>
                                    <input
                                        id="reg-confirm-password"
                                        type="password"
                                        className="form-input pl-10"
                                        placeholder="Repeat password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            id="reg-submit"
                            type="submit"
                            className="btn-primary-lg w-full mt-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating Account…
                                </span>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                            Sign in →
                        </Link>
                    </p>
                </div>
            </div>
            
            {/* Faculty Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface-800 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-glow-sm animate-scale-in">
                        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6 mx-auto">
                            <ShieldCheck className="w-8 h-8 text-brand-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white text-center mb-3">Admin Approval Needed</h3>
                        <p className="text-slate-400 text-center text-sm leading-relaxed mb-8">
                            Your faculty account has been created successfully. An administrator needs to approve your account before you can access faculty features.
                            <br /><br />
                            In the meantime, you can use the system as a regular student.
                        </p>
                        <button
                            onClick={() => navigate('/student/dashboard')}
                            className="btn-primary-lg w-full justify-center"
                        >
                            Continue as Student
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterPage;
