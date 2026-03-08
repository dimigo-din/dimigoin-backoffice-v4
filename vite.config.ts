import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        openwakeup: resolve(__dirname, "openwakeup/index.html"),
      },
    },
  },
})
