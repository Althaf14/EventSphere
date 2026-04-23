import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-surface-900 border-t border-white/[0.05] mt-auto relative z-10 w-full shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div className="flex items-center gap-2.5 group">
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shadow-glow-sm">
                            <Zap className="w-3.5 h-3.5 text-white" />
                        </span>
                        <span className="font-display font-bold text-base tracking-tight">
                            <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-teal-200 bg-clip-text text-transparent">Event</span>
                            <span className="text-white"> Sphere</span>
                        </span>
                    </div>

                    <p className="text-sm text-slate-500">
                        &copy; {new Date().getFullYear()} Event Sphere. All rights reserved.
                    </p>

                    <p className="text-sm text-slate-500 flex items-center gap-1">
                        Built with <span className="text-rose-500 animate-pulse">❤️</span> for colleges everywhere.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
