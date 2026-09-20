// scripts/cpanel-pack.mjs - Lightweight cPanel Deployment Packager
import fs from 'fs';
import path from 'path';

console.log('📦 Preparing ultra-lightweight cPanel deployment bundle (<100MB)...');

try {
  const standaloneDir = path.join(process.cwd(), '.next', 'standalone');
  const standaloneNextDir = path.join(standaloneDir, '.next');
  const staticSrc = path.join(process.cwd(), '.next', 'static');
  const staticDest = path.join(standaloneNextDir, 'static');
  const publicSrc = path.join(process.cwd(), 'public');
  const publicDest = path.join(standaloneDir, 'public');
  const prismaSrc = path.join(process.cwd(), 'node_modules', '.prisma');
  const prismaDest = path.join(standaloneDir, 'node_modules', '.prisma');

  // 1. Copy static and public assets to standalone folder
  console.log('📂 Linking static assets...');
  if (!fs.existsSync(staticDest)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true });
  }

  if (!fs.existsSync(publicDest)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true });
  }

  // 2. Copy Prisma engines
  console.log('💎 Linking Prisma engine binaries...');
  if (fs.existsSync(prismaSrc)) {
    fs.cpSync(prismaSrc, prismaDest, { recursive: true });
  }

  // 3. Write Phusion Passenger compatible server.js
  console.log('🚀 Generating Phusion Passenger compatible server.js...');
  const serverJsContent = `// server.js - cPanel Phusion Passenger Production Runner
const http = require('http');
const path = require('path');
const fs = require('fs');

process.env.NODE_ENV = 'production';
process.chdir(__dirname);

// Load .env
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.substring(0, idx).trim();
          let val = trimmed.substring(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  }
} catch (e) {
  console.error('Error loading .env:', e);
}

// Load Next.js Server
const NextServer = require('next/dist/server/next-server').default;

let nextConfig = {};
try {
  const requiredServerFiles = JSON.parse(
    fs.readFileSync(path.join(__dirname, '.next', 'required-server-files.json'), 'utf8')
  );
  nextConfig = requiredServerFiles.config || {};
} catch (e) {
  console.warn('Could not read required-server-files.json:', e);
}

const app = new NextServer({
  hostname: 'localhost',
  port: 3000,
  dir: __dirname,
  dev: false,
  customServer: false,
  conf: nextConfig
});

const handler = app.getRequestHandler();

const server = http.createServer(async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('Request error:', req.url, err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log('> [ENMAR] Live Server listening on ' + port);
});
`;
  fs.writeFileSync(path.join(standaloneDir, 'server.js'), serverJsContent);

  console.log('✅ Standalone package optimized for cPanel!');
} catch (error) {
  console.error('❌ Packaging failed:', error.message);
}

