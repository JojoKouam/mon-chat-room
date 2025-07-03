import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   // --- AJOUTE CETTE SECTION 'server' ---
  server: {
    proxy: {
      // Toutes les requêtes qui commencent par '/api' seront redirigées
      '/api': {
        // La cible est ton serveur backend
        target: 'http://localhost:4000',
        
        // Nécessaire pour que le backend accepte la requête
        changeOrigin: true, 
      },
    },
  },
})
