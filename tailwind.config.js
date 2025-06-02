/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        secondaryBrown: "#8A8475",
      },
    },
  },
  plugins: ["@tailwindcss/forms"],
  theme: {
    extend: {
      spacing: {
        // Adds a “h-15” and “w-15” utility = 3.75rem (60px)
        15: "5rem",
      },
    },
  },
};
