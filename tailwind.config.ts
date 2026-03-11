import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      colors: {
        ds: {
          blue:        '#1A73E8',
          'blue-hover':'#1557B0',
          'blue-tint': '#E8F0FE',
          'blue-dark': '#0D47A1',
          'bg':        '#FFFFFF',
          'bg-alt':    '#F8F9FA',
          'bg-card':   '#F1F3F4',
          'text':      '#202124',
          'body':      '#3C4043',
          'muted':     '#5F6368',
          'faint':     '#80868B',
          'ghost':     '#BDC1C6',
          'border':    '#DADCE0',
          'border-mid':'#E8EAED',
          green:       '#137333',
          'green-bg':  '#E6F4EA',
          red:         '#C5221F',
          'red-bg':    '#FCE8E6',
          'footer':    '#202124',
          'footer-text':'#E8EAED',
          'footer-link':'#9AA0A6',
        },
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        lg: '12px',
        pill: '100px',
      },
      boxShadow: {
        sm: '0 1px 4px rgba(0,0,0,0.06)',
        md: '0 4px 16px rgba(0,0,0,0.10)',
        lg: '0 8px 32px rgba(0,0,0,0.12)',
        blue: '0 4px 20px rgba(26,115,232,0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
