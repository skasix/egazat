import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from 'child_process';

// Plugin to generate sitemap after build
const sitemapPlugin = () => ({
  name: 'sitemap-generator',
  writeBundle() {
    console.log('🔨 Generating sitemap...');
    try {
      execSync('node scripts/generate-sitemap.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to generate sitemap:', error);
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
}));
