/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1F2A44',
        'dark-card': '#2C3E50',
        'dark-accent': '#3498DB',
        'dark-text': '#E2E8F0',
        'dark-muted': '#94A3B8',
      },
    },
  },
  plugins: [],
};