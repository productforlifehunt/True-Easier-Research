/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--bg-primary)',
          dark: 'var(--bg-primary)'
        },
        secondary: 'var(--text-secondary)',
        accent: 'var(--accent)',
        error: 'var(--error)',
        success: 'var(--success)'
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        label: 'var(--text-label)',
        error: 'var(--text-error)'
      }
    },
  },
  plugins: [],
}
