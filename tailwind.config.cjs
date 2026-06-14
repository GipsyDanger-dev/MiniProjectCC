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

                /* xAI canvas tokens — semi-transparent */
                canvas: { DEFAULT: "#0a0a0a", soft: "rgba(26,28,32,0.7)", card: "rgba(25,25,25,0.7)", mid: "#363a3f" },
                hairline: "rgba(33,35,39,0.8)",
                ink: { DEFAULT: "#ffffff", hover: "#fafaf7" },
                body: { DEFAULT: "#dadbdf", mid: "#7d8187" },

                /* xAI accent palette */
                sunset: { DEFAULT: "#ff7a17", soft: "#ffc285" },
                dusk: { DEFAULT: "#7c3aed" },
                twilight: "#c4b5fd",
                breeze: "#a0c3ec",
                midnight: "#0d1726",

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

                /* Compat tokens */
                ink: { DEFAULT: "#ffffff", 2: "hsl(var(--ink2))", 3: "hsl(var(--ink3))" },
                surface: { DEFAULT: "#0a0a0a", 2: "rgba(25,25,25,0.7)", 3: "rgba(33,35,39,0.6)" },
                edge: { DEFAULT: "rgba(33,35,39,0.8)", 2: "rgba(54,58,63,0.5)" },
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
