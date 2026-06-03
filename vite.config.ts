import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { digitalTwinApiPlugin } from './plugins/digitalTwinApiPlugin';

export default defineConfig({
  plugins: [react(), digitalTwinApiPlugin()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
  },
});
