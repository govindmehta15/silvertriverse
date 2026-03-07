/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060a14',
          900: '#0a0e1a',
          800: '#111827',
          700: '#1a2332',
          600: '#243044',
        },
        teal: {
          950: '#071e2c',
          900: '#0d2b3e',
          800: '#133a52',
          700: '#1a4d6e',
          600: '#216088',
        },
        gold: {
          DEFAULT: '#C9A227',
          50: '#faf5e4',
          100: '#f0e4b8',
          200: '#e6d38c',
          300: '#e0c068',
          400: '#d4ad3a',
          500: '#C9A227',
          600: '#a8871f',
          700: '#876c19',
          800: '#665113',
          900: '#44370d',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 15px rgba(201, 162, 39, 0.4), 0 0 30px rgba(201, 162, 39, 0.1)',
        'glow-gold-lg': '0 0 20px rgba(201, 162, 39, 0.5), 0 0 40px rgba(201, 162, 39, 0.2)',
        'glow-legendary': '0 0 20px rgba(201, 162, 39, 0.6), 0 0 40px rgba(201, 162, 39, 0.3), inset 0 0 20px rgba(201, 162, 39, 0.1)',
        'glow-rare': '0 0 15px rgba(26, 77, 110, 0.5), 0 0 30px rgba(26, 77, 110, 0.2)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A227, #e0c068, #C9A227)',
        'gold-gradient-hover': 'linear-gradient(135deg, #d4ad3a, #f0e4b8, #d4ad3a)',
        'navy-gradient': 'linear-gradient(180deg, #0a0e1a, #0d2b3e)',
        'card-gradient': 'linear-gradient(145deg, rgba(26, 35, 50, 0.9), rgba(13, 43, 62, 0.6))',
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(201, 162, 39, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(201, 162, 39, 0.7)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
