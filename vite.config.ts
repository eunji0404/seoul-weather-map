import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 개발 중에는 /api 요청을 로컬 프록시 서버(3001)로 넘긴다.
// 이렇게 하면 기상청 authKey가 브라우저 코드에 노출되지 않는다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
