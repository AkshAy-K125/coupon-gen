import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/coupon-gen/',  // ✅ Add this line
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose to network
    https: false,    // Set to true if you need HTTPS for camera testing
    open: false      // Don't auto-open browser since we're using network IP
  }
})
