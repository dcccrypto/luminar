/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme tokens from PRD
        bg: '#0B0B0F',
        surface: '#111216',
        'surface-2': '#15171A',
        text: '#FFFFFF',
        muted: '#B7BCC3',
        glow: 'rgba(255,255,255,0.18)',
        success: '#B1F3C1',
        error: '#F4B1B1',
        'btn-bg': '#FFFFFF',
        'btn-fg': '#0B0B0F',
      },
      backgroundImage: {
        'btn-sheen': 'linear-gradient(180deg,#FFFFFF 0%,#EDEFF2 40%,#DCE1E6 100%)',
      },
      borderRadius: {
        'luminar': '14px',
      },
      boxShadow: {
        'luminar': '0 6px 22px rgba(0,0,0,.35)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
