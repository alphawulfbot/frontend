/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#18181b", // dark background
        text: "#f4f4f5",      // light text
        primary: "#ffd700",   // gold
        secondary: "#23232b", // dark secondary
        accent: "#8b7500",    // accent color
      },
    },
  },
  plugins: [],
} 