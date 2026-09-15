// scripts/cpanel-pack.mjs - Lightweight cPanel Deployment Packager
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('📦 Preparing ultra-lightweight cPanel deployment bundle (<100MB)...');

try {
  // 1. Build standalone Next.js app
  console.log('⚡ Running Next.js standalone build...');
  execSync('npm run build', { stdio: 'inherit' });

  const standaloneDir = path.join(process.cwd(), '.next', 'standalone');
  const standaloneNextDir = path.join(standaloneDir, '.next');
  const staticSrc = path.join(process.cwd(), '.next', 'static');
  const staticDest = path.join(standaloneNextDir, 'static');
  const publicSrc = path.join(process.cwd(), 'public');
  const publicDest = path.join(standaloneDir, 'public');

  // 2. Copy static and public assets to standalone folder
  console.log('📂 Linking static assets...');
  if (!fs.existsSync(staticDest)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true });
  }

  if (!fs.existsSync(publicDest)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true });
  }

  // 3. Create .htaccess for cPanel Node.js App
  const htaccessContent = `# cPanel Node.js Application Routing
PassengerAppRoot "${process.cwd()}"
PassengerAppType node
PassengerStartupFile server.js
PassengerNodejs "/usr/bin/node"

RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
`;
  fs.writeFileSync(path.join(standaloneDir, '.htaccess'), htaccessContent);

  console.log('✅ Lightweight standalone bundle ready in .next/standalone');
  console.log('👉 You can upload .next/standalone directly to your cPanel directory.');
} catch (error) {
  console.error('❌ Build failed:', error.message);
}
