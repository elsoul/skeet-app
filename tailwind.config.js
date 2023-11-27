/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        'loaded-light': ['Inter_300Light', ...defaultTheme.fontFamily.sans],
        'loaded-normal': ['Inter_400Regular', ...defaultTheme.fontFamily.sans],
        'loaded-medium': ['Inter_500Medium', ...defaultTheme.fontFamily.sans],
        'loaded-bold': ['Inter_700Bold', ...defaultTheme.fontFamily.sans],
      },
      height: {
        'screen-bar-xs': '82vh',
        'screen-bar': '90vh',
      },
    },
  },
  plugins: [],
}
