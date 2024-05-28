export const content = [
  './src/**/*.{js,jsx,ts,tsx}',
  './index.html',
  './errors/**/*.html',
];

/** @type {import('tailwindcss').Config} */
export const theme = {
  colors: {
    white: '#fff',
    background: 'rgb(var(--color-background) / <alpha-value>)',
    header: 'rgb(var(--color-header) / <alpha-value>)',
    button: 'rgb(var(--color-button) / <alpha-value>)',

    subtitle: 'rgb(var(--color-subtitle) / <alpha-value>)',
    title: 'rgb(var(--color-title) / <alpha-value>)',
    text: 'rgb(var(--color-text) / <alpha-value>)',

    accent: 'rgb(var(--color-accent) / <alpha-value>)',
    warning: 'rgb(var(--color-warning) / <alpha-value>)',

    outline: 'rgb(var(--color-outline) / <alpha-value>)',
  },

  extend: {
    width: {
      post: '32rem',
    },
    gridTemplateRows: {
      post: '32px 1fr',
    },

    gridTemplateColumns: {
      header: '1fr 2fr 1fr',
      miniheader: '2fr 1fr',
      post: '32px 1fr',
    },
  },
};
