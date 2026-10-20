import type { Config } from 'tailwindcss';
import formsPlugin from '@tailwindcss/forms';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        stellar: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffe',
          300: '#7cc3fd',
          400: '#36a4fa',
          500: '#0c87eb',
          600: '#026bc8',
          700: '#0355a2',
          800: '#074885',
          900: '#0c3d6e',
          950: '#082749',
        },
      },
    },
  },
  plugins: [formsPlugin],
};

export default config;
