import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0a0b',
          light: '#141416',
          card: '#1a1a1c',
        },
        cream: {
          DEFAULT: '#e8d5b7',
          soft: '#f0e6d3',
          muted: '#c4b49a',
        },
        gold: {
          DEFAULT: '#e8d5b7',
          light: '#f0e6d3',
          muted: '#c4b49a',
        },
        green: {
          DEFAULT: '#22c55e',
          light: '#4ade80',
        },
        gray: {
          DEFAULT: '#e5e7eb',
          muted: '#71717a',
          dark: '#374151',
        },
      },
      fontFamily: {
        serif: ['Instrument Serif', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
