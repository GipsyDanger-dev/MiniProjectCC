/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./resources/views/**/*.blade.php", "./resources/js/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Inter"', "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
                mono: ['"Geist Mono"', '"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
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

                /* xAI canvas tokens */
                canvas: { DEFAULT: "#0a0a0a", soft: "#1a1c20", card: "#191919", mid: "#363a3f" },
                hairline: "#212327",
                ink: { DEFAULT: "#ffffff", hover: "#fafaf7" },
                body: { DEFAULT: "#dadbdf", mid: "#7d8187" },

                /* xAI accent palette (reserved) */
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
                    DEFAULT: "hsl(var(--sidebar-bg))",
                    foreground: "hsl(var(--sidebar-fg))",
                    muted: "hsl(var(--sidebar-muted))",
                    active: "hsl(var(--sidebar-active))",
                    "active-foreground": "hsl(var(--sidebar-active-fg))",
                    border: "hsl(var(--sidebar-border))",
                    hover: "hsl(var(--sidebar-hover))",
                },
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
                /* xAI uses no shadows — keep these for semantic use only */
                none: "none",
            },
            animation: { "fade-in-up": "fade-in-up 0.3s ease-out both" },
            keyframes: { "fade-in-up": { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } } },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
