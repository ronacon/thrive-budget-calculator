import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base must match the GitHub Pages project path: https://ronacon.github.io/thrive-budget-calculator/
export default defineConfig({
  base: '/thrive-budget-calculator/',
  plugins: [react()],
})
