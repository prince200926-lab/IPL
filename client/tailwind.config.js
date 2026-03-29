export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        pitch: {
          900: "#0a1628",
          800: "#0f2040",
          700: "#1a3a5c",
          600: "#1e4976",
        },
        gold: {
          400: "#ffd700",
          500: "#f5c518",
          600: "#e6a817",
        },
        ipl: {
          blue: "#004ba0",
          purple: "#5b2d8e",
          orange: "#ff6b00",
        },
      },
      animation: {
        "pulse-fast": "pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slideIn 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateY(-20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        bounceIn: {
          "0%": { transform: "scale(0.5)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};