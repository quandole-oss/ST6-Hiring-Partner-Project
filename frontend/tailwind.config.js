/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      colors: {
        st6: {
          teal: {
            900: "#0f4c5c",
            800: "#145e6e",
            700: "#1a7181",
            600: "#1f8493",
          },
          orange: {
            DEFAULT: "#f57c00",
            light: "#ff9800",
            dark: "#e65100",
          },
        },
      },
    },
  },
  plugins: [],
};
