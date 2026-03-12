/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OLED Surface system
        'surface-base': '#09090b',
        'surface-1': '#111318',
        'surface-2': '#16181d',
        'surface-3': '#1e2028',
        'surface-4': '#262830',

        // Accent colors
        'accent-cyan': '#00f0ff',
        'accent-emerald': '#10b981',
        'accent-amber': '#f59e0b',
        'accent-purple': '#a855f7',

        // Status colors
        'status-healthy': '#10b981',
        'status-warning': '#f59e0b',
        'status-critical': '#ef4444',
        'status-info': '#3b82f6',
        'status-offline': '#6b7280',

        // Alert legacy compat
        'alert-red': '#ef4444',

        // Border
        'border-subtle': 'rgba(255, 255, 255, 0.06)',
        'border-glow': 'rgba(0, 240, 255, 0.15)',
      },
      backgroundColor: {
        'primary': '#09090b',
        'secondary': '#111318',
        'tertiary': '#16181d',
      },
      textColor: {
        'primary': '#f0f0f5',
        'secondary': '#8b8fa3',
        'accent': '#00f0ff',
        'danger': '#ef4444',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.15), 0 0 60px rgba(0, 240, 255, 0.05)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.15), 0 0 60px rgba(16, 185, 129, 0.05)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.15), 0 0 60px rgba(245, 158, 11, 0.05)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.15), 0 0 60px rgba(239, 68, 68, 0.05)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
