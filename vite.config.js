import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This matches the 'font-khmer' class used in our LangContext
        khmer: ['Battambang', 'system-ui'],
      },
    },
  },
  plugins: [react(),
    tailwindcss()
  ],
})
