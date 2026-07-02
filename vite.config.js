import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base must match the path this app is served from: https://thrivepropertyeducation.co.uk/calculator/
export default defineConfig({
  base: '/calculator/',
  plugins: [react()],
})
