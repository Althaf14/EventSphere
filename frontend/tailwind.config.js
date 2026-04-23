/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Primary brand — Teal / Cyan
                brand: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                    950: '#042f2e',
                },
                // Accent — Rose / Pink
                accent: {
                    50: '#fff1f2',
                    100: '#ffe4e6',
                    200: '#fecdd3',
                    300: '#fda4af',
                    400: '#fb7185',
                    500: '#f43f5e',
                    600: '#e11d48',
                    700: '#be123c',
                    800: '#9f1239',
                    900: '#881337',
                },
                // Surface — warm dark
                surface: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    900: '#0b1120',
                    800: '#111827',
                    750: '#151e2d',
                    700: '#1c2a3e',
                    600: '#243447',
                    500: '#2e4058',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(182,80%,14%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(200,70%,12%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(170,60%,10%,1) 0px, transparent 50%)',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'fade-in-up': 'fadeInUp 0.5s ease-out',
                'slide-in-left': 'slideInLeft 0.4s ease-out',
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
                fadeInUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
                slideInLeft: { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
                shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
                float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
                glow: { from: { boxShadow: '0 0 10px rgba(20,184,166,0.3)' }, to: { boxShadow: '0 0 30px rgba(20,184,166,0.6), 0 0 60px rgba(20,184,166,0.15)' } },
            },
            boxShadow: {
                'glow-sm': '0 0 12px rgba(20,184,166,0.25)',
                'glow': '0 0 24px rgba(20,184,166,0.35)',
                'glow-lg': '0 0 48px rgba(20,184,166,0.30)',
                'glow-accent': '0 0 24px rgba(244,63,94,0.30)',
                'card': '0 4px 24px rgba(0,0,0,0.40)',
                'card-lg': '0 8px 48px rgba(0,0,0,0.50)',
                'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
            },
            backdropBlur: { xs: '2px' },
        },
    },
    plugins: [],
}
