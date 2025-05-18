/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Editor color palette - sleek dark theme with accents
        'editor-bg': '#121212',
        'editor-surface': '#1E1E1E',
        'editor-surface-light': '#2A2A2A',
        'editor-border': '#333333',
        'editor-text': '#F5F5F5',
        'editor-text-muted': '#AAAAAA',
        'editor-primary': '#6366F1', // Indigo
        'editor-primary-hover': '#4F46E5',
        'editor-accent': '#EC4899', // Pink
        'editor-accent-hover': '#DB2777',
        'editor-success': '#10B981', // Green
        'editor-warning': '#F59E0B', // Amber
        'editor-error': '#EF4444', // Red
        'editor-timeline': '#1A1A1A',
        'editor-timeline-active': '#2C2C2C',
        'editor-scrubber': '#EC4899', 
        'editor-clip': '#3B82F6',
        'editor-clip-audio': '#8B5CF6',
        'editor-clip-text': '#F59E0B',
      },
      fontFamily: {
        'sans': ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        'mono': ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      spacing: {
        'timeline': '160px',
      },
      boxShadow: {
        'panel': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'timeline-clip': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'pulse-gentle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};