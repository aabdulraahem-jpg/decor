import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A876',
          light: '#E8DCC4',
          dark: '#A88B5E',
        },
        navy: {
          DEFAULT: '#1A1F2E',
          light: '#252B3D',
          lighter: '#2E3650',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
