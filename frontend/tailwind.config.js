/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#e67e00",
          "orange-light": "#f5a623",
          "orange-bg": "#fff8ee",
          red: "#c0392b",
          "red-dark": "#a93226",
          blue: "#2471a3",
          "blue-bg": "#eaf4fb",
        }
      },
      fontFamily: {
        sans: ["Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
}