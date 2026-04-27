import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0d1b2a',
          lighter: '#1b263b',
        },
        gold: {
          DEFAULT: '#c9a55c',
          dark: '#a88947',
        },
        cream: '#faf7f2',
      },
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
