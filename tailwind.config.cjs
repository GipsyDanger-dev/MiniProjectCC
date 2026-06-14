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
                sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
                mono: ['"Geist Mono"', '"JetBrains Mono"', "ui-monospace", "monospace"],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
                secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
                muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
                accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
                card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
                popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
                destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },

                /* Semantic */
                danger: { DEFAULT: "hsl(var(--danger))", foreground: "hsl(var(--danger-foreground))" },
                success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
                warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },

                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    muted: "hsl(var(--sidebar-muted))",
                    active: "hsl(var(--sidebar-active))",
                    "active-foreground": "hsl(var(--sidebar-active-foreground))",
                    border: "hsl(var(--sidebar-border))",
                },

                /* Canvas & surface tokens */
                canvas: { DEFAULT: "hsl(var(--canvas))", soft: "hsl(var(--canvas-soft))", card: "hsl(var(--canvas-card))", mid: "hsl(var(--canvas-mid))" },
                hairline: "hsl(var(--hairline))",
                ink: { DEFAULT: "hsl(var(--ink))", 2: "hsl(var(--ink2))", 3: "hsl(var(--ink3))" },
                surface: "hsl(var(--surface))",
                "surface2": "hsl(var(--surface2))",
                "surface3": "hsl(var(--surface3))",
                edge: "hsl(var(--edge))",
                "edge2": "hsl(var(--edge2))",
                body: { DEFAULT: "hsl(var(--body))", mid: "hsl(var(--body-mid))" },
            },
            borderRadius: {
                none: "0px",
                sm: "8px",
                md: "8px",
                lg: "8px",
                pill: "9999px",
                full: "9999px",
            },
            boxShadow: {
                none: "none",
                card: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
                "card-hover": "0 4px 12px rgba(0,0,0,0.4)",
            },
            animation: { "fade-in-up": "fade-in-up 0.35s ease-out both" },
            keyframes: { "fade-in-up": { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } } },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
