import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from 'child_process';

// Plugin to generate sitemap and static pages after build
const sitemapPlugin = () => ({
  name: 'sitemap-generator',
  writeBundle() {
    console.log('🔨 Generating sitemap...');
    try {
      execSync('node scripts/generate-sitemap.js', { stdio: 'inherit' });
      console.log('✅ Sitemap generated');
    } catch (error) {
      console.error('❌ Failed to generate sitemap:', error);
    }
    
    console.log('🔨 Generating static HTML pages...');
    try {
      execSync('node scripts/generate-static.js', { stdio: 'inherit' });
      console.log('✅ Static pages generated');
    } catch (error) {
      console.error('❌ Failed to generate static pages:', error);
    }

    console.log('🔨 Injecting meta tags...');
    try {
      execSync('node scripts/inject-meta.js', { stdio: 'inherit' });
      console.log('✅ Meta tags injected');
    } catch (error) {
      console.error('❌ Failed to inject meta tags:', error);
    }

    console.log('🔨 Injecting hreflang tags...');
    try {
      execSync('node scripts/inject-hreflang.js', { stdio: 'inherit' });
      console.log('✅ Hreflang tags injected');
    } catch (error) {
      console.error('❌ Failed to inject hreflang tags:', error);
    }

    console.log('🔨 Running canonical verification...');
    try {
      execSync('node scripts/canonical-verify.js', { stdio: 'inherit' });
      console.log('✅ Canonical verification passed');
    } catch (error) {
      console.error('❌ Canonical verification failed:', error);
    }
  }
});

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
    sitemapPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Performance optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-popover'],
          icons: ['lucide-react'],
          utils: ['class-variance-authority', 'clsx', 'tailwind-merge'],
        },
      },
    },
    // Enable source maps for production debugging
    sourcemap: mode === 'production' ? 'hidden' : true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Minify CSS
    cssMinify: true,
    // Enable tree shaking
    target: 'es2015',
    // Optimize assets
    assetsDir: 'assets',
    // Generate manifest for PWA
    manifest: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      '@radix-ui/react-slot',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
    ],
  },
}));
