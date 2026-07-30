import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#F97316',
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#F97316',
          600: '#ea6d0a',
          700: '#c2570b',
        },
        gh: {
          dark: '#0d1117',
          darker: '#010409',
          border: '#30363d',
          surface: '#161b22',
          text: '#e6edf3',
          muted: '#7d8590',
          green: '#238636',
          'green-light': '#2ea043',
          orange: '#F97316',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
        mono: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'monospace']
      }
    }
  },
  plugins: []
}

export default config