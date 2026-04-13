/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tgt: {
          black: '#231F20',
          red: '#ED1C24',
          'red-dark': '#B8151B',
          'red-light': '#FF4C52',
          beige: '#E2DBCE',
          blue: '#455E6E',
          gray: { 100: '#D0D0D0', 200: '#9D9D9C', 300: '#575756' }
        }
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        body: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
}
