/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  // Optimize CSS output
  corePlugins: {
    // Disable unused features to reduce CSS size
    preflight: true, // Keep preflight for base styles
  },
  // Remove unused styles in production
  safelist: [
    // Keep dynamic classes that might be missed
    'dark',
    'dark-mode',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Semantic colors mapped to HSL
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
        info: "hsl(var(--info))",
        // Ethereal Design System - Dynamically inherits from active color palette
        // Uses CSS variables defined in index.css which map to palette colors
        ethereal: {
          cyan: "var(--ethereal-cyan)",
          white: "var(--ethereal-white)",
          violet: "var(--ethereal-violet)",
          text: "var(--ethereal-text)",
          glass: "var(--ethereal-bg-glass)",
          "glass-hover": "var(--ethereal-bg-hover)",
          border: "var(--ethereal-border)",
          "border-hover": "var(--ethereal-border-hover)",
          light: "var(--ethereal-light-color)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        ethereal: "var(--ethereal-card-radius)",
        "ethereal-sm": "var(--ethereal-card-radius-small)",
        "ethereal-lg": "var(--ethereal-card-radius-large)",
      },
      fontFamily: {
        sans: ['Cinzel', 'serif'],
        heading: ['Cinzel', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        'ethereal-body': ['Cinzel', 'serif'],
        'ethereal-heading': ['Cinzel', 'serif'],
      },
      boxShadow: {
        'ethereal-base': 'var(--ethereal-shadow-base)',
        'ethereal-hover': 'var(--ethereal-shadow-hover)',
        'ethereal-elevated': 'var(--ethereal-shadow-elevated)',
      },
      backdropBlur: {
        'ethereal': 'var(--ethereal-card-blur)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "aurora": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(20px, -20px) scale(1.1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "aurora": "aurora 10s ease-in-out infinite alternate",
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}