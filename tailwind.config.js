/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{vue,js,ts}'
  ],
  theme: {
    extend: {
      animation: {
        'toast-in': 'toast-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'toast-out': 'toast-out 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'progress-bar': 'progress-bar linear forwards'
      },
      keyframes: {
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(-20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        'toast-out': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-10px) scale(0.95)' }
        },
        'progress-bar': {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        }
      },
      borderRadius: {
        'toast': '0.625rem', // 10px
        'toast-full': '9999px',
        'toast-progress': '0 0 20px 50px'
      },
      boxShadow: {
        'toast': '0 6px 20px rgba(0, 0, 0, 0.15)',
        'toast-lg': '0 10px 40px rgba(0, 0, 0, 0.7)'
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false // Disable Tailwind's reset to avoid conflicts
  }
}