import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/card-slider-2.0-next-gen-1/', // 👈 Wajib ada nama repo ini
})