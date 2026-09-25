import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm Cream Canvas and Neutral Surfaces
        warm: {
          50: '#FAF8F5',
          100: '#F3EFE9',
          200: '#EAE4DC',
          300: '#DBD3C7',
          400: '#BCB1A1',
          500: '#9E9280',
          600: '#7A6F5E',
          700: '#5C5243',
          800: '#3D362C',
          900: '#211D17',
        },
        // Vibrant Orange Accent (PrepLoop primary accent & CTA)
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Deep Indigo / Royal Blue Accent (Q logo, secondary CTA, badges)
        indigo: {
          50: '#eef2ff',
          100: '#ede9fe',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Deep Midnight Navy (Text and active pill filter)
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        surface: {
          canvas: '#FAF8F5',
          subtle: '#F3EFE9',
          card: '#FFFFFF',
          border: '#EAE4DC',
        },
      },
      boxShadow: {
        'warm-xs': '0 1px 2px 0 rgba(33, 29, 23, 0.04)',
        'warm-sm': '0 1px 3px 0 rgba(33, 29, 23, 0.08), 0 1px 2px -1px rgba(33, 29, 23, 0.06)',
        'warm-md': '0 4px 6px -1px rgba(33, 29, 23, 0.08), 0 2px 4px -2px rgba(33, 29, 23, 0.06)',
        'orange-sm': '0 1px 3px 0 rgba(234, 88, 12, 0.25)',
        'orange-md': '0 4px 10px -1px rgba(234, 88, 12, 0.3)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
