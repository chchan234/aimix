/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F48FB1', // Soft Pink
        'primary-foreground': '#FFFFFF',
        'background-light': '#FFFFFF', // Pure White
        'background-dark': '#FCE4EC', // Light Pink
        'sidebar-dark': 'rgba(255, 255, 255, 0.85)', // Glassmorphism base
        border: '#F3E5F5', // Light Lavender Border
        input: 'hsl(var(--input))',
        ring: '#F48FB1',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT: '#E1BEE7', // Lavender
          foreground: '#4A3F47',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: '#FCE4EC', // Light Pink
          foreground: '#8B6F7A',
        },
        accent: {
          DEFAULT: '#F8BBD0', // Coral Pink
          foreground: '#4A3F47',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        display: ['"Pretendard"', '"Noto Sans KR"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif KR"', '"Pretendard"', 'serif'],
        sans: ['"Pretendard"', '"Noto Sans KR"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
