import type { Config } from "tailwindcss"

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        raleway: ["Raleway", "sans-serif"],
      },
      colors: {
        main: "#FF4A01",
        dark: "#33343F",
        neutral: "#71737F",
      },
    },
  },
  plugins: [],
} satisfies Config
