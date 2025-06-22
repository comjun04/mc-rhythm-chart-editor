require('dotenv').config()

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        sm: process.env.DEVELOPING_ON_MOBILE === 'true' ? '400px' : '640px',
      },
    },
  },
  plugins: [],
}
