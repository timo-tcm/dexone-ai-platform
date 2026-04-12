import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dexone: {
          primary: '#1e3a5f',
          secondary: '#2563EB',
        },
        module: {
          mb: '#4F46E5',
          dx: '#2563EB',
          bl: '#059669',
          dc: '#D97706',
          cx: '#EA580C',
          an: '#7C3AED',
          pl: '#0D9488',
          gv: '#374151',
        }
      }
    },
  },
  plugins: [],
}
export default config
