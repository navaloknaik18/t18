/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        t18: {
          bg: '#090a0f',
          surface: '#12151f',
          card: '#181c2b',
          border: '#23293d',
          blue: '#0066ff',
          cyan: '#00f3ff',
          neon: '#00ffee',
          red: '#ff0055',
          gold: '#ffd700',
          darkline: '#2f354d'
        }
      },
      fontFamily: {
        gaming: ['Rajdhani', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['SFMono-Regular', 'Consolas', 'Courier New', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 243, 255, 0.35)',
        'glow-blue': '0 0 25px rgba(0, 102, 255, 0.4)',
        'glow-red': '0 0 20px rgba(255, 0, 85, 0.4)',
        'hud': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-radar': 'radarPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'nitro-burn': 'nitroBurn 0.3s ease-in-out infinite alternate',
        'float-slow': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        radarPulse: {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '100%': { transform: 'scale(2.5)', opacity: '0' }
        },
        nitroBurn: {
          '0%': { opacity: '0.7', transform: 'scaleY(1)' },
          '100%': { opacity: '1', transform: 'scaleY(1.3)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      }
    },
  },
  plugins: [],
}
