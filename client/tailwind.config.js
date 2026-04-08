/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#7c3aed',
      },
    },
  },
  plugins: [],
};
