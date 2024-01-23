/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}","./index.html"],
  theme: {
    extend: {
      gridTemplateColumns: {
        'h-layout' : '1fr 2fr 1fr',
      }
    },
  },
  plugins: [],
}

