import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: 'var(--color-primary)',
          accent: 'var(--color-accent)',
          'accent-2': 'var(--color-accent-2)',
          bg: 'var(--color-bg)',
          card: 'var(--color-card)',
          border: 'var(--color-border)',
          muted: 'var(--color-muted)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
