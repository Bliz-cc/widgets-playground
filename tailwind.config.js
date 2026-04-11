/** @type {import('tailwindcss').Config} */
export default {
  // Use JIT mode for performance
  mode: 'jit',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@blizcc/ui/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Add any global theme extensions you had in the monorepo here
    },
  },
  // Exact optimizations from your monorepo config
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Core plugin overrides from your monorepo
  corePlugins: {
    preflight: true,
    container: false, // Explicitly disabled as per your config
  },
  plugins: [],
};
