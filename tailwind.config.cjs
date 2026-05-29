/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./resources/views/**/*.blade.php", "./resources/js/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: { sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"] },
            colors: {
                border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
                background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
                primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
                secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
                muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
                accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
                card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
                popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
                destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
                violet: { DEFAULT: "hsl(var(--accent-violet))", light: "hsl(var(--accent-violet-light))", foreground: "hsl(var(--accent-violet-foreground))" },
                danger: { DEFAULT: "hsl(var(--danger))", foreground: "hsl(var(--danger-foreground))" },
                success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
                warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },
                sidebar: { DEFAULT: "hsl(var(--sidebar-bg))", foreground: "hsl(var(--sidebar-fg))", muted: "hsl(var(--sidebar-muted))", active: "hsl(var(--sidebar-active))", "active-foreground": "hsl(var(--sidebar-active-fg))", border: "hsl(var(--sidebar-border))" },
            },
            boxShadow: { card: "var(--shadow-card)", "card-hover": "var(--shadow-card-hover)", violet: "var(--shadow-violet)" },
            animation: { "fade-in-up": "fade-in-up 0.35s ease-out both" },
            keyframes: { "fade-in-up": { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } } },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
