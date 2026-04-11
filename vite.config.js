import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        laravel({
            input: [
                "resources/css/app.css",
                "resources/js/app.js",
                "resources/css/style.css", // Tambahkan ini
                "resources/js/script.js", // Tambahkan ini
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
    optimizeDeps: {
        include: ["chart.js"],
    },
    server: {
        watch: {
            ignored: ["**/storage/framework/views/**"],
        },
    },
});
