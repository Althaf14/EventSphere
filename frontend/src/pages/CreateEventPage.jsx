import { useState, useRef } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus, Trash2, Sparkles, Loader2, CalendarPlus, Target, Layers, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import SignatureCanvas from 'react-signature-canvas';

const CreateEventPage = () => {
    const [eventType, setEventType] = useState('SINGLE');
    const [formData, setFormData] = useState({
        title: '', description: '', department: '', venue: '',
        eventDate: '', startTime: '', endTime: '', maxParticipants: '', category: '',
    });
    const [subEvents, setSubEvents] = useState([]);
    const [eventImage, setEventImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const [certificateInfo, setCertificateInfo] = useState({
        coordinatorName: 'Event Coordinator',
        principalName: 'Principal',
        coordinatorSignatureImage: null,
        principalSignatureImage: null
    });

    const [coordSigMode, setCoordSigMode] = useState('upload'); // 'upload' or 'draw'
    const [prinSigMode, setPrinSigMode] = useState('upload'); // 'upload' or 'draw'
    const coordSigPad = useRef(null);
    const prinSigPad = useRef(null);

    const getSignatureFile = (padRef, fileName) => {
        if (padRef.current && !padRef.current.isEmpty()) {
            const dataURL = padRef.current.getCanvas().toDataURL('image/png');
            const arr = dataURL.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) { u8arr[n] = bstr.charCodeAt(n); }
            const blob = new Blob([u8arr], { type: mime });
            return new File([blob], `${fileName}.png`, { type: 'image/png' });
        }
        return null;
    };

    const [coordinators, setCoordinators] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleEventTypeChange = (e) => {
        setEventType(e.target.value);
        if (e.target.value === 'SINGLE') setSubEvents([]);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowed.includes(file.type)) { setError('Only image files (JPEG, PNG, GIF, WebP) are allowed'); return; }
        if (file.size > 5 * 1024 * 1024) { setError('Image size should not exceed 5MB'); return; }
        setEventImage(file);
        setImagePreview(URL.createObjectURL(file));
        setError(null);
    };

    const addSubEvent = () => setSubEvents([...subEvents, { id: Date.now(), title: '', eventDate: formData.eventDate || '', startTime: '', endTime: '', venue: '', maxParticipants: '' }]);
    const removeSubEvent = (id) => setSubEvents(subEvents.filter(s => s.id !== id));
    const updateSubEvent = (id, field, value) => setSubEvents(subEvents.map(s => s.id === id ? { ...s, [field]: value } : s));

    const searchCoordinators = async (name) => {
        if (!name?.trim()) { setSearchResults([]); return; }
        setSearching(true);
        try {
            const { data } = await api.get(`/events/search-users?name=${encodeURIComponent(name)}`);
            setSearchResults(data.filter(u => !coordinators.some(c => c._id === u._id)));
        } catch { setSearchResults([]); }
        finally { setSearching(false); }
    };

    const addCoordinator = (u) => { setCoordinators([...coordinators, u]); setSearchResults([]); setSearchName(''); };
    const removeCoordinator = (uid) => setCoordinators(coordinators.filter(c => c._id !== uid));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const fd = new FormData();
            Object.keys(formData).forEach(k => { if (formData[k]) fd.append(k, formData[k]); });
            fd.append('eventType', eventType);
            if (coordinators.length > 0) fd.append('coordinators', JSON.stringify(coordinators.map(c => c._id)));
            if (eventImage) fd.append('eventImage', eventImage);

            // Add certificate info
            fd.append('coordinatorName', certificateInfo.coordinatorName);
            fd.append('principalName', certificateInfo.principalName);

            let coordDrawnFile = null;
            let prinDrawnFile = null;
            if (coordSigMode === 'draw') coordDrawnFile = getSignatureFile(coordSigPad, 'coordinatorSignature');
            if (prinSigMode === 'draw') prinDrawnFile = getSignatureFile(prinSigPad, 'principalSignature');

            if (coordSigMode === 'draw' && coordDrawnFile) fd.append('coordinatorSignature', coordDrawnFile);
            else if (coordSigMode === 'upload' && certificateInfo.coordinatorSignatureImage) fd.append('coordinatorSignature', certificateInfo.coordinatorSignatureImage);

            if (prinSigMode === 'draw' && prinDrawnFile) fd.append('principalSignature', prinDrawnFile);
            else if (prinSigMode === 'upload' && certificateInfo.principalSignatureImage) fd.append('principalSignature', certificateInfo.principalSignatureImage);

            const { data: created } = await api.post('/events', fd);

            if (eventType === 'MULTI' && subEvents.length > 0) {
                await Promise.all(subEvents.map(sub => {
                    if (sub.image) {
                        const sfd = new FormData();
                        Object.entries({ title: sub.title, parentEvent: created._id, eventDate: sub.eventDate, startTime: sub.startTime, endTime: sub.endTime, venue: sub.venue, maxParticipants: sub.maxParticipants, department: formData.department, category: formData.category }).forEach(([k, v]) => { if (v) sfd.append(k, v); });
                        sfd.append('eventImage', sub.image);
                        return api.post('/events', sfd);
                    } else {
                        return api.post('/events', { title: sub.title, parentEvent: created._id, eventDate: sub.eventDate, startTime: sub.startTime, endTime: sub.endTime, venue: sub.venue, maxParticipants: sub.maxParticipants, department: formData.department, category: formData.category });
                    }
                }));
                toast.success(`Big Event created with ${subEvents.length} sub-event${subEvents.length > 1 ? 's' : ''}!`);
            } else {
                toast.success('Event created successfully!');
            }

            setSuccess(true);
            setTimeout(() => navigate('/events'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event');
            toast.error(err.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper animate-fade-in-up max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="section-tag"><CalendarPlus className="w-3.5 h-3.5" /> Event Creation</div>
                <h1 className="page-heading mb-1">Create New Event</h1>
                <p className="text-slate-400 text-sm">Fill in the details to publish a new event.</p>
            </div>

            <div className="card-lg">
                {error && <div className="alert-error mb-6"><X className="w-4 h-4 flex-shrink-0" />{error}</div>}
                {success && <div className="alert-success mb-6">Event created successfully! Redirecting…</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Event Type */}
                    <div>
                        <label className="form-label">Event Type *</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'SINGLE', label: 'Single Event', desc: 'One standalone event', icon: '🎯' },
                                { value: 'MULTI', label: 'Big Event', desc: 'Multiple sub-events', icon: '🎪' },
                            ].map(({ value, label, desc, icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleEventTypeChange({ target: { value } })}
                                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${eventType === value
                                        ? 'bg-brand-500/15 border-brand-500/40 text-brand-300'
                                        : 'bg-surface-700/40 border-white/10 text-slate-400 hover:border-white/20'}`}
                                >
                                    <div className="text-xl mb-1">{icon}</div>
                                    <div className="font-semibold text-sm">{label}</div>
                                    <div className="text-xs text-slate-500">{desc}</div>
                                </button>
                            ))}
                        </div>
                        {eventType === 'MULTI' && (
                            <p className="text-xs text-violet-400 mt-2 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                Big Events contain multiple sub-events that students register for individually
                            </p>
                        )}
                    </div>

                    <div className="divider" />

                    {/* Coordinator Search */}
                    <div>
                        <label className="form-label">Event Coordinators <span className="text-slate-500 font-normal">(optional)</span></label>
                        <p className="text-xs text-slate-500 mb-3">Add faculty or coordinators who can help manage this event.</p>
                        <div className="relative mb-3">
                            <input
                                type="text"
                                className="form-input pr-24"
                                placeholder="Search by name…"
                                value={searchName}
                                onChange={(e) => { setSearchName(e.target.value); searchCoordinators(e.target.value); }}
                                disabled={loading}
                            />
                            {searching && <span className="absolute right-4 top-3 text-xs text-slate-400">Searching…</span>}
                        </div>
                        {searchResults.length > 0 && (
                            <div className="mb-3 bg-surface-700/60 rounded-xl border border-white/[0.08] max-h-44 overflow-y-auto">
                                {searchResults.map(u => (
                                    <div key={u._id} className="p-3 hover:bg-white/[0.04] transition flex items-center justify-between border-b border-white/[0.04] last:border-0">
                                        <div>
                                            <p className="text-white text-sm font-semibold">{u.name}</p>
                                            <p className="text-xs text-slate-400">{u.email}</p>
                                            <div className="flex gap-2 mt-1"><span className="badge-info">{u.role}</span></div>
                                        </div>
                                        <button type="button" onClick={() => addCoordinator(u)} className="btn-primary btn-xs">Add</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {coordinators.length > 0 && (
                            <div className="space-y-2">
                                {coordinators.map(c => (
                                    <div key={c._id} className="flex items-center justify-between bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-2.5">
                                        <div>
                                            <p className="text-white text-sm font-semibold">{c.name}</p>
                                            <p className="text-xs text-slate-400">{c.email}</p>
                                        </div>
                                        <button type="button" onClick={() => removeCoordinator(c._id)} className="text-red-400 hover:text-red-300 transition">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="divider" />

                    {/* Image Upload */}
                    <div>
                        <label className="form-label">Event Poster</label>
                        {!imagePreview ? (
                            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-surface-700/30 hover:bg-surface-700/50 transition group">
                                <Upload className="w-9 h-9 mb-3 text-slate-500 group-hover:text-brand-400 transition-colors" />
                                <p className="text-sm text-slate-400 mb-1"><span className="text-brand-400 font-semibold">Click to upload</span> or drag &amp; drop</p>
                                <p className="text-xs text-slate-500">PNG, JPG, GIF, WebP — max 5 MB</p>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        ) : (
                            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-white/[0.08]">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => { setEventImage(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="form-label">Event Title *</label>
                        <input type="text" name="title" required className="form-input" placeholder={eventType === 'MULTI' ? 'e.g. Tech Fest 2025' : 'e.g. Annual Tech Symposium'} value={formData.title} onChange={handleChange} />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="form-label">Description</label>
                        <textarea name="description" rows={4} className="form-textarea" placeholder="Event details, agenda, what to expect…" value={formData.description} onChange={handleChange} />
                    </div>

                    {/* Department & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="form-label">Department</label>
                            <input type="text" name="department" className="form-input" placeholder="e.g. Computer Science" value={formData.department} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="form-label">Category</label>
                            <input type="text" name="category" className="form-input" placeholder="e.g. Workshop, Hackathon" value={formData.category} onChange={handleChange} />
                        </div>
                    </div>

                    {/* SINGLE Event Fields */}
                    {eventType === 'SINGLE' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="form-label">Date *</label>
                                    <input type="date" name="eventDate" required className="form-input" value={formData.eventDate} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="form-label">Start Time</label>
                                    <input type="time" name="startTime" className="form-input" value={formData.startTime} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="form-label">End Time</label>
                                    <input type="time" name="endTime" className="form-input" value={formData.endTime} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="form-label">Venue</label>
                                    <input type="text" name="venue" className="form-input" placeholder="e.g. Auditorium A" value={formData.venue} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="form-label">Max Participants</label>
                                    <input type="number" name="maxParticipants" className="form-input" placeholder="e.g. 100" value={formData.maxParticipants} onChange={handleChange} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* MULTI Event Date */}
                    {eventType === 'MULTI' && (
                        <div>
                            <label className="form-label">Main Event Date *</label>
                            <input type="date" name="eventDate" required className="form-input" value={formData.eventDate} onChange={handleChange} />
                            <p className="form-hint">This is the overall date for the Big Event umbrella.</p>
                        </div>
                    )}

                    {/* Sub Events */}
                    {eventType === 'MULTI' && (
                        <div className="border-t border-white/[0.06] pt-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="section-heading mb-0">Sub Events</h3>
                                <button type="button" onClick={addSubEvent} className="btn-primary btn-sm">
                                    <Plus className="w-4 h-4" /> Add Sub Event
                                </button>
                            </div>

                            {subEvents.length === 0 ? (
                                <div className="empty-state py-10 bg-surface-700/20 rounded-2xl border border-dashed border-white/10">
                                    <div className="empty-state-icon bg-violet-500/10 border-violet-500/20">
                                        <Sparkles className="w-7 h-7 text-violet-400" />
                                    </div>
                                    <p className="text-slate-400 text-sm">No sub-events yet. Click "Add Sub Event" to create one.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {subEvents.map((sub, idx) => (
                                        <div key={sub.id} className="card bg-violet-500/5 border-violet-500/20">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-semibold text-white flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                                                    Sub Event {idx + 1}
                                                </h4>
                                                <button type="button" onClick={() => removeSubEvent(sub.id)} className="text-red-400 hover:text-red-300 transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="form-label">Title *</label>
                                                    <input type="text" required className="form-input" placeholder="e.g. Hackathon" value={sub.title} onChange={e => updateSubEvent(sub.id, 'title', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="form-label">Event Poster</label>
                                                    <input type="file" className="form-input text-xs" accept="image/*" onChange={e => updateSubEvent(sub.id, 'image', e.target.files[0])} />
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="form-label">Date *</label>
                                                        <input type="date" required className="form-input" value={sub.eventDate} onChange={e => updateSubEvent(sub.id, 'eventDate', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Start</label>
                                                        <input type="time" className="form-input" value={sub.startTime} onChange={e => updateSubEvent(sub.id, 'startTime', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">End</label>
                                                        <input type="time" className="form-input" value={sub.endTime} onChange={e => updateSubEvent(sub.id, 'endTime', e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="form-label">Venue</label>
                                                        <input type="text" className="form-input" placeholder="e.g. Lab 101" value={sub.venue} onChange={e => updateSubEvent(sub.id, 'venue', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Max Participants</label>
                                                        <input type="number" className="form-input" placeholder="50" value={sub.maxParticipants} onChange={e => updateSubEvent(sub.id, 'maxParticipants', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Certificate Configuration */}
                    <div className="border-t border-white/[0.06] pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <h2 className="font-display text-xl font-bold text-white">Certificate Settings</h2>
                        </div>
                        <p className="text-sm text-slate-400 mb-6">Set the authorities and signatures that will appear on the participation certificates.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Coordinator Settings */}
                            <div className="space-y-4 p-4 rounded-xl border border-white/[0.08] bg-surface-700/30">
                                <h3 className="font-semibold text-white">Coordinator Details</h3>
                                <div>
                                    <label className="form-label text-sm">Coordinator Name</label>
                                    <input
                                        type="text"
                                        className="form-input text-sm"
                                        placeholder="e.g. Prof. John Doe"
                                        value={certificateInfo.coordinatorName}
                                        onChange={(e) => setCertificateInfo({ ...certificateInfo, coordinatorName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="form-label text-sm mb-0">Signature Type</label>
                                        <div className="flex bg-surface-800 rounded-lg p-0.5">
                                            <button type="button" onClick={() => setCoordSigMode('upload')} className={`px-2 py-1 text-xs rounded-md ${coordSigMode === 'upload' ? 'bg-surface-600 text-white' : 'text-slate-400 hover:text-white'}`}>Upload</button>
                                            <button type="button" onClick={() => setCoordSigMode('draw')} className={`px-2 py-1 text-xs rounded-md ${coordSigMode === 'draw' ? 'bg-surface-600 text-white' : 'text-slate-400 hover:text-white'}`}>Draw</button>
                                        </div>
                                    </div>
                                    {coordSigMode === 'upload' ? (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="form-input text-sm"
                                            onChange={(e) => setCertificateInfo({ ...certificateInfo, coordinatorSignatureImage: e.target.files[0] })}
                                        />
                                    ) : (
                                        <div className="border border-white/10 rounded-lg bg-white overflow-hidden relative">
                                            <SignatureCanvas penColor="black" canvasProps={{ className: 'w-full h-32' }} ref={coordSigPad} containerClassName="sig-wrapper" />
                                            <button type="button" onClick={() => coordSigPad.current?.clear()} className="absolute top-2 right-2 text-xs text-slate-400 hover:text-slate-700 bg-white/80 px-2 py-1 rounded">Clear</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Principal Settings */}
                            <div className="space-y-4 p-4 rounded-xl border border-white/[0.08] bg-surface-700/30">
                                <h3 className="font-semibold text-white">Principal Details</h3>
                                <div>
                                    <label className="form-label text-sm">Principal Name</label>
                                    <input
                                        type="text"
                                        className="form-input text-sm"
                                        placeholder="Principal"
                                        value={certificateInfo.principalName}
                                        onChange={(e) => setCertificateInfo({ ...certificateInfo, principalName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="form-label text-sm mb-0">Signature Type</label>
                                        <div className="flex bg-surface-800 rounded-lg p-0.5">
                                            <button type="button" onClick={() => setPrinSigMode('upload')} className={`px-2 py-1 text-xs rounded-md ${prinSigMode === 'upload' ? 'bg-surface-600 text-white' : 'text-slate-400 hover:text-white'}`}>Upload</button>
                                            <button type="button" onClick={() => setPrinSigMode('draw')} className={`px-2 py-1 text-xs rounded-md ${prinSigMode === 'draw' ? 'bg-surface-600 text-white' : 'text-slate-400 hover:text-white'}`}>Draw</button>
                                        </div>
                                    </div>
                                    {prinSigMode === 'upload' ? (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="form-input text-sm"
                                            onChange={(e) => setCertificateInfo({ ...certificateInfo, principalSignatureImage: e.target.files[0] })}
                                        />
                                    ) : (
                                        <div className="border border-white/10 rounded-lg bg-white overflow-hidden relative">
                                            <SignatureCanvas penColor="black" canvasProps={{ className: 'w-full h-32' }} ref={prinSigPad} containerClassName="sig-wrapper" />
                                            <button type="button" onClick={() => prinSigPad.current?.clear()} className="absolute top-2 right-2 text-xs text-slate-400 hover:text-slate-700 bg-white/80 px-2 py-1 rounded">Clear</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <button type="submit" disabled={loading || success} className="btn-primary-lg w-full justify-center">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarPlus className="w-5 h-5" />}
                            {loading ? 'Creating Event…' : success ? '✓ Created!' : eventType === 'MULTI' ? `Create Big Event${subEvents.length > 0 ? ` (${subEvents.length} sub-events)` : ''}` : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventPage;
