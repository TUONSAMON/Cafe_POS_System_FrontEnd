/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        khmer: ['Battambang', 'system-ui'],
        sans: ['Inter', 'system-ui'],
      },
    },
  },
  plugins: [],
};