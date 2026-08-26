/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          950: "#090a0f",
          900: "#0f111a",
          850: "#141724",
          800: "#1a1e30",
          700: "#272c45",
          600: "#383f61",
        },
        accent: {
          blue: "#38bdf8",
          indigo: "#6366f1",
          emerald: "#10b981",
        }
      },
    },
  },
  plugins: [],
}