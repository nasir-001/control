/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,vue}"],
  theme: {
    extend: {
      colors: {
        'text-primary': '#056106'
      }
    },
  },
  plugins: [],
  prefix: 'tw-'
}
