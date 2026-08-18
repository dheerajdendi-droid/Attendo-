/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Black-and-gold identity: ink (near-black backgrounds/surfaces/body
        // text), gold (brand/headings/key monetary values), emerald
        // (positive/active/CTA states), danger (errors/warnings).
        ink: {
          950: "#050505",
          900: "#0D0D0D",
          800: "#1A1A1A",
          700: "#242220",
          600: "#332F2A",
          400: "#8A7F68",
          300: "#A89C82",
          200: "#C9BFA8",
          100: "#EDE4D3",
        },
        gold: {
          400: "#E3C158",
          500: "#D4AF37",
          600: "#B8952A",
        },
        emerald: {
          400: "#3DBE82",
          500: "#2FA36B",
          600: "#24875A",
        },
        danger: {
          400: "#F07860",
          500: "#E0533D",
          600: "#C43F2B",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
