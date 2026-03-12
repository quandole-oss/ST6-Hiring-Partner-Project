/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      colors: {
        st6: {
          teal: {
            950: "#071e26",
            900: "#0d3340",
            800: "#104555",
            700: "#145e6e",
            600: "#1a7181",
            500: "#1f8493",
            400: "#2a9aab",
            300: "#4db8c8",
            200: "#8dd8e2",
            100: "#c8eef3",
            50: "#eaf8fb",
          },
          orange: {
            DEFAULT: "#f57c00",
            light: "#ff9800",
            dark: "#e65100",
            50: "#fff3e0",
            100: "#ffe0b2",
          },
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px -2px rgba(0,0,0,0.1), 0 2px 6px -2px rgba(0,0,0,0.06)",
        "card-lg": "0 10px 40px -8px rgba(0,0,0,0.12), 0 4px 16px -4px rgba(0,0,0,0.08)",
        glow: "0 0 20px rgba(15, 76, 92, 0.25)",
        "glow-orange": "0 0 20px rgba(245, 124, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
