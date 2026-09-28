/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0b0d11",
        surface: "#141721",
        borderSubtle: "rgba(255, 255, 255, 0.08)",
      },
    },
  },
  plugins: [],
}