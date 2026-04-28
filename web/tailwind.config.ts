import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#2c2e3a',
          lighter: '#3d4054',
        },
        gold: {
          DEFAULT: '#a8896d',
          dark: '#7d6450',
        },
        cream: '#f7f3ec',
        sand: '#ede4d3',
        clay: {
          DEFAULT: '#a8896d',
          dark: '#7d6450',
          light: '#d8c5ad',
        },
        sage: {
          DEFAULT: '#8a9a7b',
          dark: '#6b7a5f',
        },
      },
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
