/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        medical: {
          red:    '#e63946',
          blue:   '#0077b6',
          teal:   '#2ec4b6',
          cyan:   '#00b4d8',
          green:  '#06d6a0',
          purple: '#7b2d8b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },                          '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      backgroundImage: {
        'medical-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'hero-gradient':    'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0c4a6e 100%)',
        'card-gradient':    'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      }
    },
  },
  plugins: [],
}
