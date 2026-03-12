import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    server: {
        host: true,
    },
    plugins: [
        react(),
        tailwindcss()
    ],
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "${path.resolve(__dirname, 'src/styles/mixins').replace(/\\/g, '/')}" as *;\n`,
            },
        },
    },
});