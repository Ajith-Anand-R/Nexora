/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:     ['Inter', 'sans-serif'],
        display:  ['Plus Jakarta Sans', 'sans-serif'],
        mono:     ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        aurora: {
          bg:      '#f8fafc',
          surface: '#ffffff',
        }
      },
      backgroundImage: {
        'gradient-aurora': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 40%, #e8eeff 100%)',
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-cyan':    'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-amber':   'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-rose':    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      },
      boxShadow: {
        'glow-sm':  '0 0 12px rgba(99, 102, 241, 0.2)',
        'glow-md':  '0 0 24px rgba(99, 102, 241, 0.25)',
        'glow-lg':  '0 0 40px rgba(99, 102, 241, 0.3)',
        'premium':  '0 8px 24px -4px rgba(99, 102, 241, 0.12), 0 4px 8px -2px rgba(0,0,0,0.08)',
        'premium-lg': '0 24px 48px -8px rgba(99, 102, 241, 0.18), 0 8px 16px -4px rgba(0,0,0,0.1)',
      },
      animation: {
        'float': 'card-float 6s ease-in-out infinite',
        'float-slow': 'card-float 9s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.23,1,0.32,1) both',
        'spin-ring': 'spin-ring 0.8s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'card-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'spin-ring': {
          to: { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.3)' },
          '50%':       { boxShadow: '0 0 0 8px rgba(99,102,241,0)' },
        },
      },
      backdropBlur: {
        xs:  '4px',
        '2xl': '40px',
        '3xl': '64px',
      }
    },
  },
  plugins: [],
}
