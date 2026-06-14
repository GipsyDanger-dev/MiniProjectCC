/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "Inter",
                    "system-ui",
                    "-apple-system",
                    "sans-serif",
                ],
                mono: [
                    '"JetBrains Mono"',
                    "ui-monospace",
                    "monospace",
                ],
            },
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
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                lime: {
                    DEFAULT: "hsl(var(--accent-lime))",
                    foreground: "hsl(var(--accent-lime-foreground))",
                },
                purple: {
                    DEFAULT: "hsl(var(--accent-lime))",
                    foreground: "hsl(var(--accent-lime-foreground))",
                },
                "dark-card": {
                    DEFAULT: "hsl(var(--surface2))",
                    foreground: "hsl(var(--ink2))",
                },
                "deep-green": {
                    DEFAULT: "hsl(var(--deep-green))",
                    foreground: "hsl(var(--deep-green-foreground))",
                },
                danger: {
                    DEFAULT: "hsl(var(--danger))",
                    foreground: "hsl(var(--danger-foreground))",
                },
                success: {
                    DEFAULT: "hsl(var(--success))",
                    foreground: "hsl(var(--success-foreground))",
                },
                warning: {
                    DEFAULT: "hsl(var(--warning))",
                    foreground: "hsl(var(--warning-foreground))",
                },
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    muted: "hsl(var(--sidebar-muted))",
                    active: "hsl(var(--sidebar-active))",
                    "active-foreground": "hsl(var(--sidebar-active-foreground))",
                    border: "hsl(var(--sidebar-border))",
                },
                ink: {
                    DEFAULT: "hsl(var(--ink))",
                    2: "hsl(var(--ink2))",
                    3: "hsl(var(--ink3))",
                },
                surface: {
                    DEFAULT: "hsl(var(--surface))",
                    2: "hsl(var(--surface2))",
                    3: "hsl(var(--surface3))",
                },
                edge: {
                    DEFAULT: "hsl(var(--edge))",
                    2: "hsl(var(--edge2))",
                },
            },
            boxShadow: {
                card: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
                "card-hover": "0 4px 12px rgba(0,0,0,0.4)",
                elevated: "0 8px 24px rgba(0,0,0,0.4)",
                accent: "0 0 0 1px hsl(38 90% 50% / 0.15)",
            },
            borderRadius: {
                none: "0",
                lg: "0.5rem",
            },
            animation: {
                "fade-in-up": "fade-in-up 0.25s ease-out both",
            },
            keyframes: {
                "fade-in-up": {
                    "0%": { opacity: "0", transform: "translateY(4px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
