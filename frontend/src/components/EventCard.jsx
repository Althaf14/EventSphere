import React from 'react';
import { Calendar, MapPin, Clock, Users, ShieldCheck, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, user, isRegistered, onRegister, onUnregister }) => {
    const navigate = useNavigate();

    const getEventImage = (event) => {
        if (event.eventImage) return `http://localhost:5000${event.eventImage}`;
        return `https://picsum.photos/seed/${event._id}/800/600`;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Upcoming': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
            case 'Ongoing': return 'bg-brand-500/20 text-brand-300 border border-brand-500/30';
            case 'Completed': return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
        }
    };

    const isFull = event.maxParticipants && event.registeredCount >= event.maxParticipants;
    const isUpcoming = event.status === 'Upcoming';
    const isBigEvent = event.eventType === 'MULTI';
    const fillPct = event.maxParticipants
        ? Math.min(((event.registeredCount || 0) / event.maxParticipants) * 100, 100)
        : 0;

    const handleViewSubEvents = () => navigate(`/events/${event._id}`);

    return (
        <div
            onClick={handleViewSubEvents}
            className="group relative bg-surface-800/80 rounded-2xl overflow-hidden border border-white/[0.06]
                       shadow-card flex flex-col h-full
                       hover:-translate-y-1 hover:shadow-glow-sm hover:border-brand-500/20
                       transition-all duration-300 cursor-pointer"
        >
            {/* ── Image ─────────────────────────────── */}
            <div className="relative h-44 overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-surface-800 via-surface-800/40 to-transparent z-10" />
                <img
                    src={getEventImage(event)}
                    alt={event.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-20">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${getStatusBadge(event.status)}`}>
                        {event.status}
                    </span>
                </div>

                {/* Category Badge */}
                {event.category && (
                    <div className="absolute top-3 left-3 z-20">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-600/90 text-white border border-brand-400/30">
                            {event.category}
                        </span>
                    </div>
                )}

                {/* Big Event Badge */}
                {isBigEvent && (
                    <div className="absolute bottom-3 left-3 z-20">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-violet-600 to-brand-600 text-white border border-violet-400/40 flex items-center gap-1 shadow-lg">
                            <Sparkles className="w-3 h-3" />
                            Multi-Event
                        </span>
                    </div>
                )}
            </div>

            {/* ── Content ───────────────────────────── */}
            <div className="p-5 flex-grow flex flex-col relative z-20 -mt-6">
                {/* Department + Title */}
                <div className="mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-1 block">
                        {event.department || 'General'}
                    </span>
                    <h3 className="font-display text-base font-bold text-white leading-snug group-hover:text-brand-300 transition-colors line-clamp-2">
                        {event.title}
                    </h3>
                </div>

                {/* Meta Info */}
                <div className="flex flex-col gap-1.5 mb-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                        <span>{new Date(event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {!isBigEvent && event.startTime && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                            <span>{event.startTime}</span>
                        </div>
                    )}
                    {!isBigEvent && event.venue && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                            <span className="truncate">{event.venue}</span>
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-grow leading-relaxed">
                    {event.description}
                </p>

                {/* Footer */}
                <div className="mt-auto space-y-3" onClick={(e) => e.stopPropagation()}>
                    {/* Participants Progress */}
                    {!isBigEvent && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" /> Capacity
                                </span>
                                <span className={isFull ? 'text-red-400 font-semibold' : ''}>
                                    {event.registeredCount} / {event.maxParticipants || '∞'}
                                </span>
                            </div>
                            <div className="progress-track">
                                <div
                                    style={{ width: `${fillPct}%` }}
                                    className={isFull ? 'progress-bar-full' : 'progress-bar'}
                                />
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {isBigEvent ? (
                        <button
                            onClick={handleViewSubEvents}
                            className="w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5
                                       bg-gradient-to-r from-violet-600 to-brand-600 hover:from-violet-500 hover:to-brand-500
                                       text-white shadow-glow-sm hover:shadow-glow transition-all duration-300 active:scale-[0.98]"
                        >
                            View Sub Events <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    ) : user?.role === 'student' ? (
                        <div className="flex gap-2">
                            {isRegistered ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onUnregister(event._id); }}
                                    className="flex-1 py-2.5 px-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5
                                               bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300
                                               border border-red-500/20 hover:border-red-400/40
                                               transition-all duration-200 active:scale-[0.98]"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Registered
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); !isFull && isUpcoming && onRegister(event._id); }}
                                    disabled={isFull || !isUpcoming}
                                    className={`flex-1 py-2.5 px-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5
                                        transition-all duration-200 active:scale-[0.98]
                                        ${isFull || !isUpcoming
                                            ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed border border-slate-700'
                                            : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-glow-sm hover:shadow-glow'
                                        }`}
                                >
                                    {isUpcoming ? (
                                        isFull ? (
                                            <><Users className="w-3.5 h-3.5" /> Full</>
                                        ) : (
                                            <><CheckCircle className="w-3.5 h-3.5" /> Register</>
                                        )
                                    ) : (
                                        <span>{event.status}</span>
                                    )}
                                </button>
                            )}
                            <button
                                onClick={handleViewSubEvents}
                                className="flex-1 py-2.5 px-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5
                                           bg-surface-700/60 hover:bg-surface-600/60 text-slate-300 hover:text-white
                                           border border-white/[0.06] hover:border-white/10
                                           transition-all duration-200 active:scale-[0.98]"
                            >
                                <ArrowRight className="w-3.5 h-3.5" /> Details
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleViewSubEvents}
                            className="w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5
                                       bg-surface-700/60 hover:bg-surface-600/60 text-slate-300 hover:text-white
                                       border border-white/[0.06] hover:border-white/10
                                       transition-all duration-200 active:scale-[0.98]"
                        >
                            View Details <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventCard;
