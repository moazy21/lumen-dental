/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        porcelain: '#FBFDFC',
        mist: '#EFF6F3',
        pine: '#0C3B3C',
        pincedeep: '#082A2B',
        aqua: '#2FA89A',
        aquadeep: '#1F7A70',
        mint: '#DCEEE8',
        ink: '#101E1D',
        line: '#DCE7E2'
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 20px 60px -20px rgba(12,59,60,0.25)',
        card: '0 10px 30px -12px rgba(12,59,60,0.18)'
      }
    }
  },
  plugins: []
};
