/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF6B35',
          orangeDark: '#E8551E',
          yellow: '#FFD166',
          cyan: '#06D6A0',
          teal: '#22D3EE',
          purple: '#9B5DE5',
          pink: '#EC4899',
          red: '#EF476F',
          black: '#121214',
          canvas: '#FFFDF7',
          surface: '#F4F4F0',
          dark: '#0E0F12',
          darkCard: '#15161A',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', '"Bricolage Grotesque"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        brutal: '4px 4px 0px #121214',
        'brutal-sm': '2px 2px 0px #121214',
        'brutal-lg': '6px 6px 0px #121214',
        'brutal-orange': '4px 4px 0px #FF6B35',
        'brutal-white': '4px 4px 0px #FFFFFF',
      },
    },
  },
  plugins: [],
};

