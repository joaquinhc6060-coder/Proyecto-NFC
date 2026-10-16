/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#12141a',
          secondary: '#1c1f27',
          dark: '#0b0c10',
        },
        cream: {
          DEFAULT: '#fbf6ee',
          secondary: '#f2e9db',
        },
        orange: {
          brand: '#ff5a2e',
          hover: '#d93f14',
          light: '#ff8a4c',
          tint: '#ff5a2e14',
        },
        teal: {
          brand: '#16d1b0',
          hover: '#13b89b',
        },
        muted: {
          DEFAULT: '#5d6370',
          light: '#b4b9c4',
          dim: '#e6e8ee',
        }
      },
      maxWidth: {
        layout: '1120px',
      },
      borderRadius: {
        'card': '22px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(22, 209, 176, 0.55)' },
          '100%': { boxShadow: '0 0 0 40px rgba(22, 209, 176, 0)' },
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.8s infinite',
      }
    },
  },
  plugins: [],
}

