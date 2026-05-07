import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  root: process.cwd(),
  server: {
    port: 3000,
    allowedHosts: true,
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart(),
    viteReact(),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "react-dropzone": "/home/engine/project/app/node_modules/react-dropzone/dist/es/index.js",
      "@xixixao/uploadstuff/esm/UploadButton": "/home/engine/project/app/node_modules/@xixixao/uploadstuff/esm/UploadButton.js",
      "@xixixao/uploadstuff/esm/UploadDropzone": "/home/engine/project/app/node_modules/@xixixao/uploadstuff/esm/UploadDropzone.js",
      "@xixixao/uploadstuff/esm/UploadSpinner": "/home/engine/project/app/node_modules/@xixixao/uploadstuff/esm/UploadSpinner.js",
      "@xixixao/uploadstuff/esm/useUploadFiles": "/home/engine/project/app/node_modules/@xixixao/uploadstuff/esm/useUploadFiles.js",
    },
  },
})
