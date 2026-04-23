import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Award, Download, Calendar, MapPin, Loader2 } from 'lucide-react';

const MyCertificatesPage = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/my-attendance')
            .then(({ data }) => setCertificates(data.filter(r => r.status === 'Present')))
            .catch((err) => setError(err.response?.data?.message || 'Failed to fetch certificates'))
            .finally(() => setLoading(false));
    }, []);

    const handleDownload = async (eventId, eventTitle) => {
        try {
            const response = await api.get(`/events/${eventId}/certificate`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate-${eventTitle.replace(/ /g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch {
            alert('Failed to download certificate. Please try again.');
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
    );

    return (
        <div className="page-wrapper animate-fade-in-up">
            {/* Header */}
            <div className="mb-10">
                <div className="section-tag"><Award className="w-3.5 h-3.5 text-amber-400" /><span className="text-amber-400">Achievements</span></div>
                <h1 className="page-heading mb-1">My Certificates</h1>
                <p className="text-slate-400 text-sm">Congratulations on your achievements! Here are your earned participation certificates.</p>
            </div>

            {error && <div className="alert-error mb-6">{error}</div>}

            {certificates.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon bg-amber-500/10 border border-amber-500/20">
                        <Award className="w-9 h-9 text-amber-400/60" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white mb-2">No Certificates Yet</h2>
                    <p className="text-slate-400 text-sm max-w-sm text-center">
                        Attend events and have your attendance marked to receive participation certificates.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((record) => (
                        <div key={record._id} className="card-hover relative overflow-hidden">
                            {/* Decorative amber glow */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />

                            <div className="flex items-start justify-between mb-5">
                                <span className="badge-warning flex items-center gap-1">
                                    <Award className="w-3 h-3" /> Certified
                                </span>
                                <Award className="w-8 h-8 text-amber-400/60" />
                            </div>

                            <h3 className="card-title mb-3 line-clamp-2">{record.event?.title}</h3>

                            <div className="space-y-2 mb-6 text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                    {record.event?.eventDate ? new Date(record.event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                                    {record.event?.venue || 'N/A'}
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(record.event._id, record.event.title)}
                                className="w-full btn-accent justify-center"
                            >
                                <Download className="w-4 h-4" /> Download PDF
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCertificatesPage;
