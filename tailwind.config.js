/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#195AA6', // Main blue color
          light: '#4A73B3',
          dark: '#0F4A8A',
        },
        secondary: {
          DEFAULT: '#E47120', // Orange color
          light: 'rgba(228, 113, 32, 0.2)',
        },
        error: {
          DEFAULT: '#EB1F1F', // Red color
          light: 'rgba(235, 31, 31, 0.2)',
        },
        neutral: {
          white: '#FFFFFF',
          light: '#F4F4F4',
          medium: '#E3ECF5',
          gray: '#D9D9D9',
          darkgray: '#B7B7B7',
          dark: '#000000',
        }
      },
      fontFamily: {
        'frutiger': ['Frutiger Std', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

