/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#047857',    // emerald-700
          primaryDark: '#065f46',// emerald-800
          accent: '#f59e0b',     // amber-500
          accentDark: '#d97706', // amber-600
        }
      }
    },
  },
  plugins: [],
}
