/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(252, 78%, 62%)',
        secondary: 'hsl(172, 67%, 44%)',
        accent: 'hsl(39, 90%, 54%)',
        success: 'hsl(142, 76%, 36%)',
        warning: 'hsl(46, 95%, 50%)',
        error: 'hsl(0, 84%, 50%)',
        background: 'hsl(210, 20%, 98%)',
        surface: 'hsl(0, 0%, 100%)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '32px',
      },
      boxShadow: {
        'card': '0 8px 24px hsla(210,10%,20%,0.12)',
        'popover': '0 16px 48px hsla(210,10%,20%,0.16)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to bottom right, hsl(252, 78%, 62%), hsl(39, 90%, 54%))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}