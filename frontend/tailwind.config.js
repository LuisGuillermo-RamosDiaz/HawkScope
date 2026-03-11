/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#0D0D0D',
        'accent-cyan': '#36BFB1',
        'alert-red': '#FF4C4C',
      },
      backgroundColor: {
        'primary': '#0D0D0D',
        'secondary': '#1A1A1A',
        'tertiary': '#262626',
      },
      textColor: {
        'primary': '#FFFFFF',
        'secondary': '#B0B0B0',
        'accent': '#36BFB1',
        'danger': '#FF4C4C',
      }
    },
  },
  plugins: [],
}
