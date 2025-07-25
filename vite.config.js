import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Dit is de nieuwe, complete Content Security Policy voor ONTWIKKELING
      'Content-Security-Policy': [
        "default-src 'self'", // Sta alles van de eigen server toe (basisregel)
        
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", 
        
        "style-src 'self' 'unsafe-inline' https://rsms.me", 
        
        "font-src 'self' https://rsms.me", 
        
        "connect-src 'self' http://localhost:3001", 
        
        // DE FIX: Sta afbeeldingen toe van de eigen server én via 'data:' URLs
        "img-src 'self' data:", 
      ].join('; ')
    }
  }
});
