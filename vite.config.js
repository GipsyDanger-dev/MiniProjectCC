import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
    ],
    optimizeDeps: {
        include: ["recharts"],
    },
    server: {
        watch: {
            ignored: ["**/storage/framework/views/**"],
        },
        proxy: {
            "/api": "http://127.0.0.1:8000",
            "/sanctum": "http://127.0.0.1:8000",
        },
    },
});
