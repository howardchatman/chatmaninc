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
          DEFAULT: '#0a0c10',
          light: '#10131a',
          card: '#141821',
          hover: '#1a1f2e',
        },
        accent: {
          DEFAULT: '#4fd1c5',
          bright: '#6ee7db',
          glow: 'rgba(79, 209, 197, 0.15)',
          muted: 'rgba(79, 209, 197, 0.08)',
        },
        border: {
          DEFAULT: '#1e2433',
          accent: '#2a3148',
        },
        text: {
          primary: '#e8eaf0',
          secondary: '#8b92a8',
          muted: '#565e75',
        },
        // Keep gold for admin panel backward compat
        gold: {
          DEFAULT: '#4fd1c5',
          light: '#6ee7db',
          muted: '#3ba89e',
        },
        green: {
          DEFAULT: '#22c55e',
          light: '#4ade80',
        },
        gray: {
          DEFAULT: '#e8eaf0',
          muted: '#8b92a8',
          dark: '#1e2433',
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
