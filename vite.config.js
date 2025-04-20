import { defineConfig } from 'vite'

export default defineConfig({
  base: '/', // Chemin racine pour le développement local
  server: {
    port: 5000, // Port local
    open: true // Ouvre le navigateur automatiquement
  }
})