import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    esbuild: {
        include: /src\/.*\.[jt]sx?$/,
        exclude: [],
        loader: 'jsx',
    },
})