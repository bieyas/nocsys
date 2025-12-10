/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noc: {
          900: '#0f172a', // Dark blue/slate background
          800: '#1e293b', // Panel background
          700: '#334155', // Border
          500: '#3b82f6', // Primary blue
          400: '#60a5fa', // Secondary blue
          100: '#f1f5f9', // Text light
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
