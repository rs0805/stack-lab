export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        melody: ['"Inter"', 'sans-serif'],
      },
      colors: {
        dpurple: '#800080',
        silver: '#c0c0c0',
      },
    },
  },
  plugins: [],
}