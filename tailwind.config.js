/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        'nunito': ['Nunito Sans Variable', 'Nunito Sans', 'sans-serif'],
        'sans': ['Nunito Sans Variable', 'Nunito Sans', 'sans-serif'],
        'exo': ['Exo 2', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 