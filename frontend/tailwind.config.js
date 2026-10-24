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
          950: '#0B1726',
          900: '#10243A',
          800: '#1A3654',
          700: '#264B70',
        },
        gold: {
          400: '#D8B97C',
          500: '#C7A66A',
          600: '#A88548',
        },
        aviation: {
          teal: '#168C78',
          blue: '#2563EB',
          slate: '#94A3B8',
          bg: '#F7F9FC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
