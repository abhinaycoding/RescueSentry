1/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          bg: "#EFE7DC",
          sidebar: "#E6DDD0",
          card: "#FBF7F2",
          well: "#F6F0E8",
          text: "#2A2520",
          text2: "#5C544B",
          text3: "#6B6258",
          critical: "#D13A3F",
          criticalInk: "#B52A31",
          criticalClay: "#F8C9C6",
          warning: "#F5A524",
          warningInk: "#8A5500",
          warningClay: "#FCE7B8",
          ok: "#2E9E63",
          okInk: "#1E6B42",
          okClay: "#CDEBD9",
          infoInk: "#3B4F8A",
          infoClay: "#DCE3F7",
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        'clay-card': '32px',
        'clay-hero': '34px',
        'clay-modal': '36px',
        'clay-well': '22px',
        'clay-btn': '18px',
        'clay-row': '18px',
        'clay-tile': '16px',
        'clay-pill': '999px',
      },
      boxShadow: {
        'clay-raised': 'inset -6px -6px 12px rgba(120, 90, 60, 0.12), inset 6px 6px 12px rgba(255, 255, 255, 0.9), 10px 12px 24px rgba(120, 90, 60, 0.22)',
        'clay-inset': 'inset 3px 3px 7px rgba(120, 90, 60, 0.18), inset -3px -3px 7px rgba(255, 255, 255, 0.9)',
        'clay-btn': 'inset -3px -3px 6px rgba(0, 0, 0, 0.12), inset 3px 3px 6px rgba(255, 255, 255, 0.5), 4px 6px 12px rgba(120, 90, 60, 0.25)',
        'clay-btn-hover': 'inset -3px -3px 6px rgba(0, 0, 0, 0.14), inset 3px 3px 6px rgba(255, 255, 255, 0.6), 6px 8px 16px rgba(120, 90, 60, 0.3)',
        'clay-btn-active': 'inset 3px 3px 6px rgba(0, 0, 0, 0.2), inset -2px -2px 6px rgba(255, 255, 255, 0.3), 1px 2px 4px rgba(120, 90, 60, 0.15)',
        'clay-critical': 'inset -6px -6px 12px rgba(180, 60, 60, 0.18), inset 6px 6px 12px rgba(255, 255, 255, 0.9), 10px 12px 26px rgba(180, 60, 60, 0.26)',
        'clay-warning': 'inset -6px -6px 12px rgba(180, 120, 30, 0.18), inset 6px 6px 12px rgba(255, 255, 255, 0.9), 10px 12px 24px rgba(180, 120, 30, 0.24)',
        'clay-ok': 'inset -6px -6px 12px rgba(40, 140, 80, 0.16), inset 6px 6px 12px rgba(255, 255, 255, 0.9), 10px 12px 24px rgba(40, 140, 80, 0.22)',
      }
    },
  },
  plugins: [],
}
