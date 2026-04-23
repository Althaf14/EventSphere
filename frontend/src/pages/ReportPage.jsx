import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Printer, ArrowLeft, Loader2, Award } from 'lucide-react';

const ReportPage = () => {
    const { registrationId } = useParams();
    const [certificateData, setCertificateData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/registrations/${registrationId}/certificate`)
            .then(({ data }) => setCertificateData(data))
            .catch((err) => setError(err.response?.data?.message || 'Failed to generate certificate'))
            .finally(() => setLoading(false));
    }, [registrationId]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
            <p className="text-slate-400 text-sm">Generating your certificate…</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4">
            <div className="alert-error max-w-sm text-center">{error}</div>
            <button onClick={() => navigate('/my-registrations')} className="btn-primary">
                <ArrowLeft className="w-4 h-4" /> Back to Registrations
            </button>
        </div>
    );

    return (
        <div className="page-wrapper flex flex-col items-center">
            {/* Controls (hidden on print) */}
            <div className="flex gap-3 mb-8 print:hidden w-full justify-center">
                <button
                    onClick={() => window.print()}
                    className="btn-primary-lg"
                >
                    <Printer className="w-5 h-5" /> Print / Save as PDF
                </button>
                <button
                    onClick={() => navigate('/my-registrations')}
                    className="btn-secondary"
                    style={{ paddingTop: '14px', paddingBottom: '14px' }}
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
            </div>

            {/* Certificate – white paper look */}
            <div className="bg-white text-black shadow-2xl w-full max-w-4xl border-[12px] border-double border-slate-700 text-center relative print:shadow-none print:w-full" style={{ fontFamily: 'Georgia, serif' }}>
                {/* Gold inner border */}
                <div className="absolute inset-[6px] border-2 border-amber-500/60 pointer-events-none" />

                <div className="px-12 py-14 md:px-20 md:py-20">
                    {/* Header emblem */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                            <Award className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <p className="uppercase tracking-[0.4em] text-slate-500 text-xs mb-2">Event Sphere</p>
                    <h1 className="text-5xl font-bold text-slate-800 mb-1 uppercase tracking-widest">Certificate</h1>
                    <h2 className="text-xl text-slate-500 mb-10 uppercase tracking-[0.3em]">of Participation</h2>

                    <p className="text-base text-slate-500 mb-2">This is to certify that</p>
                    <h3 className="text-4xl font-bold text-brand-700 mb-2 italic" style={{ borderBottom: '2px solid #f59e0b', display: 'inline-block', paddingBottom: '4px' }}>
                        {certificateData.studentName}
                    </h3>

                    <p className="text-base text-slate-500 mt-6 mb-4">has successfully participated in the event</p>
                    <h4 className="text-3xl font-bold text-slate-800 mb-6">
                        "{certificateData.eventName}"
                    </h4>

                    <p className="text-slate-600 text-base mb-14">
                        Held on <strong>{new Date(certificateData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                        {certificateData.venue && <> at <strong>{certificateData.venue}</strong></>}
                    </p>

                    {/* Signatures */}
                    <div className="flex justify-between items-end px-8 mt-10">
                        <div className="text-center">
                            <div className="border-t-2 border-slate-400 w-44 mx-auto mb-2" />
                            <p className="font-semibold text-slate-600 text-sm">Event Coordinator</p>
                        </div>
                        <div className="text-center opacity-20">
                            <div className="w-16 h-16 rounded-full border-2 border-slate-400 mx-auto mb-2 flex items-center justify-center">
                                <Award className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-xs text-slate-500">Official Seal</p>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-slate-400 w-44 mx-auto mb-2" />
                            <p className="font-semibold text-slate-600 text-sm">Principal / HOD</p>
                        </div>
                    </div>

                    <div className="mt-10 text-xs text-slate-400">
                        Certificate ID: {certificateData.id} &nbsp;|&nbsp; Issued: {new Date(certificateData.issuedDate).toLocaleDateString()}
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print\\:hidden { display: none !important; }
                    .bg-white, .bg-white * { visibility: visible; }
                    .bg-white {
                        position: absolute; left: 0; top: 0;
                        width: 100%; margin: 0; padding: 0;
                        box-shadow: none;
                        border: 8px double #1e293b;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReportPage;
