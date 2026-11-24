import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// On GitHub Pages the app lives under /<repo-name>/. Locally it lives at /.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? (process.env.BASE_PATH ?? '/hucha-familiar/') : '/',
  plugins: [react()],
  test: { environment: 'node' },
}))
