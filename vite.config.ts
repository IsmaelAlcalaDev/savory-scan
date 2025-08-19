
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build for performance
    minify: mode === 'production' ? 'terser' : false,
    ...(mode === 'production' && {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    }),
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Feature-based chunks - updated to only include existing files
          'restaurant-features': [
            './src/components/RestaurantCard.tsx',
            './src/components/UnifiedRestaurantsGrid.tsx',
            './src/hooks/useUnifiedRestaurantFeed.ts'
          ],
          'dish-features': [
            './src/components/DishCard.tsx',
            './src/components/DishesGrid.tsx',
            './src/hooks/useDishes.ts'
          ]
        },
        // Optimize chunk size
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
      },
      // External dependencies that should not be bundled
      external: mode === 'production' ? [] : []
    },
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    cssCodeSplit: true, // Split CSS for better caching
    sourcemap: mode === 'development',
    // Compression and optimization
    reportCompressedSize: false, // Faster builds
    chunkSizeWarningLimit: 1000, // Warning for chunks > 1MB
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  // Asset handling
  assetsInclude: ['**/*.woff2', '**/*.woff'],
}));
