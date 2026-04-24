/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      minHeight: {
        touch: '44px',
        fat: '60px',
      },
      minWidth: {
        touch: '44px',
        fat: '60px',
      },
    },
  },
  plugins: [],
};
