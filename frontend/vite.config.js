import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      port: parseInt(process.env.VITE_PORT || process.env.npm_config_port || '6002', 10),
    },
  };
});
