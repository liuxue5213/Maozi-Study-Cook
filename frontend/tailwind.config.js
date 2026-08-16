/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
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
        },
        cooking: {
          main: '#f97316',
          secondary: '#059669',
          accent: '#dc2626',
          background: '#fafafa',
          card: '#ffffff',
          text: '#1f2937',
          muted: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
  // 禁用 aspect-ratio 工具类（react-native-css-interop 解析 Bug）
  corePlugins: {
    aspectRatio: false,
  },
};
