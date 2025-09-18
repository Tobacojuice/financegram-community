module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'rgba(159, 255, 120, 0.28)',
        input: 'rgba(159, 255, 120, 0.32)',
        ring: 'rgba(190, 242, 100, 0.55)',
        background: '#000000',
        foreground: '#eaffd5',
        primary: {
          DEFAULT: '#9eff5c',
          foreground: '#051b06',
        },
        secondary: {
          DEFAULT: 'rgba(15, 26, 12, 0.85)',
          foreground: '#d7ffbc',
        },
        destructive: {
          DEFAULT: '#ff6b6b',
          foreground: '#050505',
        },
        accent: {
          DEFAULT: 'rgba(158, 255, 120, 0.08)',
          foreground: '#d7ffbc',
        },
        terminal: {
          green: '#9eff5c',
          amber: '#ffc24b',
          red: '#ff6b6b',
          cyan: '#5de3ff',
        },
      },
      fontFamily: {
        sans: ['"VT323"', 'monospace'],
        terminal: ['"VT323"', 'monospace'],
      },
      boxShadow: {
        'inner-glow': '0 0 35px rgba(152, 255, 120, 0.18)',
      },
      backgroundImage: {
        'terminal-grid':
          'linear-gradient(rgba(95, 255, 155, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(95, 255, 155, 0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        'terminal-pattern': '32px 32px',
      },
    },
  },
  plugins: [],
};
