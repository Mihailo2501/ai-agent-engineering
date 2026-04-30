// Tailwind 4 uses CSS-first config via @theme directive in globals.css.
// This file is kept minimal for editor tooling that expects it.
// Real theme tokens (palette, fonts, spacing scale) live in src/styles/globals.css
// and will be set once the design system is locked.

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,mdx}'
  ]
};
