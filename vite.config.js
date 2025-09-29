import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 라이브러리들을 별도 청크로 분리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 라이브러리들을 별도 청크로 분리
          'ui-vendor': ['framer-motion', 'react-icons'],
          // 차트 라이브러리를 별도 청크로 분리
          'chart-vendor': ['recharts', 'roughjs'],
          // 유틸리티 라이브러리들을 별도 청크로 분리
          'utils-vendor': ['date-fns', 'uuid']
        }
      }
    },
    // 청크 크기 경고 임계값 조정 (기본 500KB에서 800KB로)
    chunkSizeWarningLimit: 800
  }
})
