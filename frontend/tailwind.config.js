/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'surface-base': '#09090b',
        'surface-1': '#0c0e14',
        'surface-2': '#12141b',
        'surface-3': '#1a1c25',
        'surface-4': '#22242e',
        'surface-5': '#2a2d38',

        'accent-cyan': '#00f0ff',
        'accent-emerald': '#10b981',
        'accent-amber': '#f59e0b',
        'accent-purple': '#a855f7',
        'accent-blue': '#3b82f6',
        'accent-rose': '#f43f5e',

        'status-healthy': '#10b981',
        'status-warning': '#f59e0b',
        'status-critical': '#ef4444',
        'status-info': '#3b82f6',
        'status-offline': '#6b7280',

        'alert-red': '#ef4444',

        'border-subtle': 'rgba(255, 255, 255, 0.06)',
        'border-glow': 'rgba(0, 240, 255, 0.15)',
      },
      backgroundColor: {
        'primary': '#09090b',
        'secondary': '#0c0e14',
        'tertiary': '#12141b',
      },
      textColor: {
        'primary': '#f0f0f5',
        'secondary': '#8b8fa3',
        'accent': '#00f0ff',
        'danger': '#ef4444',
        'text-muted': '#5a5e72',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.15), 0 0 60px rgba(0, 240, 255, 0.05)',
        'glow-cyan-lg': '0 0 40px rgba(0, 240, 255, 0.2), 0 0 80px rgba(0, 240, 255, 0.08)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.15), 0 0 60px rgba(16, 185, 129, 0.05)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.15), 0 0 60px rgba(245, 158, 11, 0.05)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.15), 0 0 60px rgba(239, 68, 68, 0.05)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.15), 0 0 60px rgba(168, 85, 247, 0.05)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
      },
      backdropBlur: {
        'glass': '16px',
        'glass-heavy': '24px',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'scan': 'scan-line 4s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'grid-fade': 'grid-pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'radar': 'radar 3s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '0.5' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'grid-pulse': {
          '0%, 100%': { opacity: '0.03' },
          '50%': { opacity: '0.06' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
