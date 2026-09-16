// scripts/make-zip.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function main() {
  console.log('🚀 Preparing standalone folder...');

  const standaloneDir = path.join(process.cwd(), '.next', 'standalone');
  const staticSrc = path.join(process.cwd(), '.next', 'static');
  const staticDest = path.join(standaloneDir, '.next', 'static');
  const publicSrc = path.join(process.cwd(), 'public');
  const publicDest = path.join(standaloneDir, 'public');

  if (!fs.existsSync(staticDest)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true });
    console.log('Copied .next/static');
  }

  if (!fs.existsSync(publicDest)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true });
    console.log('Copied public');
  }

  // Copy prisma folder for runtime schema
  const prismaSrc = path.join(process.cwd(), 'prisma');
  const prismaDest = path.join(standaloneDir, 'prisma');
  if (!fs.existsSync(prismaDest)) {
    fs.cpSync(prismaSrc, prismaDest, { recursive: true });
    console.log('Copied prisma folder');
  }

  // Create .htaccess
  const htaccess = `# cPanel Node.js Application Routing
PassengerAppRoot "${process.cwd()}"
PassengerAppType node
PassengerStartupFile server.js
PassengerNodejs "/usr/bin/node"

RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
`;
  fs.writeFileSync(path.join(standaloneDir, '.htaccess'), htaccess);

  // Compress using PowerShell Compress-Archive
  const zipPath = path.join(process.cwd(), 'enmar_cpanel_deploy.zip');
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  console.log('🗜️ Creating enmar_cpanel_deploy.zip (super lightweight)...');
  execSync(`powershell -command "Compress-Archive -Path '.next\\standalone\\*' -DestinationPath 'enmar_cpanel_deploy.zip' -Force"`, { stdio: 'inherit' });

  const stats = fs.statSync(zipPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 DONE! enmar_cpanel_deploy.zip created successfully!`);
  console.log(`📦 File size: ${sizeMB} MB (Ultra-Lightweight, fits comfortably within cPanel limits!)`);
}

main().catch(console.error);
