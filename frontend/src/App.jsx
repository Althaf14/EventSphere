import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import MyAttendancePage from './pages/MyAttendancePage';
import MyCertificatesPage from './pages/MyCertificatesPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import ManageEventsPage from './pages/ManageEventsPage';
import EventRegistrationsPage from './pages/EventRegistrationsPage';
import PendingEventsPage from './pages/PendingEventsPage';
import MarkAttendancePage from './pages/MarkAttendancePage';
import ReportPage from './pages/ReportPage';
import ReportsDashboard from './pages/ReportsDashboard';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAuditLogPage from './pages/AdminAuditLogPage';
import PendingUsersPage from './pages/PendingUsersPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-surface-900 text-slate-200 font-sans selection:bg-brand-500/30">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-violet-600/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-brand-800/10 blur-3xl" />
      </div>

      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/coordinator/dashboard" element={<Dashboard />} />
              <Route path="/student/dashboard" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route path="/my-registrations" element={<MyRegistrationsPage />} />
              <Route path="/my-attendance" element={<MyAttendancePage />} />
              <Route path="/my-certificates" element={<MyCertificatesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/report/:registrationId" element={<ReportPage />} />
            </Route>

            {/* Admin only */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
            </Route>

            {/* Faculty / Admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'faculty']} />}>
              <Route path="/events/pending" element={<PendingEventsPage />} />
              <Route path="/admin/pending-users" element={<PendingUsersPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'faculty', 'coordinator']} />}>
              <Route path="/attendance" element={<MarkAttendancePage />} />
              <Route path="/reports" element={<ReportsDashboard />} />
              <Route path="/dashboard/event/:eventId/registrations" element={<EventRegistrationsPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'faculty', 'coordinator', 'student']} />}>
              <Route path="/events/manage" element={<ManageEventsPage />} />
              <Route path="/events/create" element={<CreateEventPage />} />
              <Route path="/events/edit/:id" element={<EditEventPage />} />
            </Route>

            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />

        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#34d399', secondary: '#1e293b' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#1e293b' },
            },
          }}
        />
      </div>
    </div>
  );
}

export default App;
