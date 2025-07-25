/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'spin': 'spin 1.5s linear infinite',
        'pulse': 'pulse 2s ease-in-out infinite',
        'bounce': 'bounce 1s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.3s ease-in',
        'slideInUp': 'slideInUp 0.3s ease-out',
        'slideInLeft': 'slideInLeft 0.3s ease-out',
        'scaleIn': 'scaleIn 0.3s var(--transition-ease)',
        'hoverPulse': 'hoverPulse 2s var(--transition-ease) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideInUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-10px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        hoverPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
          light: 'var(--color-secondary-light)',
          dark: 'var(--color-secondary-dark)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
          light: 'var(--color-accent-light)',
          dark: 'var(--color-accent-dark)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: {
          DEFAULT: 'var(--border)',
          dark: 'var(--sidebar-border)',
        },
        input: 'var(--input)',
        ring: {
          DEFAULT: 'var(--ring)',
        },
        sidebar: {
          bg: 'var(--sidebar-bg)',
          fg: 'var(--sidebar-fg)',
          muted: 'var(--sidebar-muted)',
          hover: 'var(--sidebar-hover)',
          active: 'var(--sidebar-active)',
          'active-fg': 'var(--sidebar-active-fg)',
          border: 'var(--sidebar-border)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          light: 'var(--color-success-bg)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light: 'var(--color-warning-bg)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          light: 'var(--color-error-bg)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          light: 'var(--color-info-bg)',
        },
        stats: {
          blue: {
            background: 'var(--stats-blue-bg)',
            foreground: 'var(--stats-blue-text)',
            accent: 'var(--color-primary)',
          },
          green: {
            background: 'var(--stats-green-bg)',
            foreground: 'var(--stats-green-text)',
            accent: 'var(--color-secondary)',
          },
          orange: {
            background: 'var(--stats-orange-bg)',
            foreground: 'var(--stats-orange-text)',
            accent: 'var(--color-accent)',
          },
          purple: {
            background: 'var(--stats-purple-bg)',
            foreground: 'var(--stats-purple-text)',
            accent: '#A855F7',
          },
          indigo: {
            background: 'var(--stats-indigo-bg)',
            foreground: 'var(--stats-indigo-text)',
            accent: '#6366F1',
          },
        },
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'active': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        heading: ['var(--font-heading)'],
        mono: ['var(--font-mono)'],
      },
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
        '4xl': 'var(--spacing-4xl)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'all': 'all',
      },
      transitionTimingFunction: {
        'bounce': 'var(--transition-bounce)',
        'ease': 'var(--transition-ease)',
        'in': 'var(--transition-in)',
        'out': 'var(--transition-out)',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'normal': 'var(--transition-normal)',
        'slow': 'var(--transition-slow)',
      },
      scale: {
        'hover': 'var(--scale-hover)',
        'active': 'var(--scale-active)',
      },
      rotate: {
        'hover': 'var(--rotate-hover)',
      },
      translate: {
        'hover': 'var(--translate-hover)',
      },
    },
  },
  plugins: [],
}