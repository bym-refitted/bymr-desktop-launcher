const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    fontFamily: {
      // Custom fonts
      sans: ['"Inter"', ...defaultTheme.fontFamily.sans],
      title: ['"Graveblade-W00-Regular"', ...defaultTheme.fontFamily.sans],
      display: ['"GROBOLDpro"', ...defaultTheme.fontFamily.serif],
    },
    extend: {
      screens: {
        // Custom breakpoints for minimum window size
        minWindowSize: "1024px",
      },
      colors: {
        // Basic colors
        transparent: "transparent",
        red: "red",
        green: "green",
        blue: "blue",
        yellow: "yellow",
        black: "black",
        white: "white",

        // App colors
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Element Colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        unselected: "hsl(var(--unselected))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      borderRadius: {
        sm: "4px", // rounded-sm
        md: "7px", // rounded-md
        lg: "10px", // rounded-lg
      },
    },
  },
};

export default config;
