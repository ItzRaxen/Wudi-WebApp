/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        white: '#F8F4EE',
        slate: {
          50: '#F5EEE6',
          100: '#EAE0D5',
          200: '#DFD2C4',
          300: '#D4C4B3',
          400: '#A79D9E',
          500: '#7D7382',
          600: '#4A4050',
          700: '#35283C',
          800: '#2A1F31',
          900: '#21182B',
          950: '#1A1121',
        },
        primary: {
          DEFAULT: '#21182B',
          dark: '#1A1121',
          light: '#35283C',
        },
        background: '#F5EEE6',
        surface: {
          DEFAULT: '#EAE0D5',
          dark: '#2A1F31',
        },
        text: {
          primary: '#1B1123',
          secondary: '#4A4050',
          tertiary: '#7D7382',
          placeholder: '#999999',
          light: 'rgba(255, 255, 255, 0.7)',
        },
        accent: {
          icon: '#A79D9E',
        },
        input: {
          darkBg: '#2A1F31',
        },
        error: {
          bg: '#FFEBEE',
          text: '#C62828',
        },
        brand: {
          50: '#F5EEE6',
          100: '#EAE0D5',
          500: '#21182B',
          600: '#35283C',
          700: '#1A1121',
        },
        ink: '#1B1123',
      },
      boxShadow: {
        soft: '0 12px 40px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
