// scripts/make-circular-favicon.mjs
import sharp from "sharp";
import fs from "fs";
import path from "path";

async function makeCircularFavicon() {
  const logoPath = path.resolve("public/assets/logo/logo.png");
  if (!fs.existsSync(logoPath)) {
    console.error("Logo file not found at", logoPath);
    return;
  }

  const size = 512;
  const radius = size / 2;

  // Create an SVG circle mask with transparent background
  const circleSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="#fff" /></svg>`
  );

  // Resize logo, crop to square, apply circular mask, and create transparent PNG
  const circularBuffer = await sharp(logoPath)
    .resize(size, size, { fit: "cover" })
    .composite([
      {
        input: circleSvg,
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  // Save to public locations and app router icons
  fs.writeFileSync(path.resolve("public/favicon.png"), circularBuffer);
  fs.writeFileSync(path.resolve("public/favicon.ico"), circularBuffer);
  fs.writeFileSync(path.resolve("public/assets/logo/logo-circle.png"), circularBuffer);
  
  if (fs.existsSync(path.resolve("app"))) {
    fs.writeFileSync(path.resolve("app/icon.png"), circularBuffer);
    fs.writeFileSync(path.resolve("app/apple-icon.png"), circularBuffer);
    fs.writeFileSync(path.resolve("app/favicon.ico"), circularBuffer);
  }

  console.log("✅ Perfectly circular favicon & icons successfully generated!");
}

makeCircularFavicon().catch(console.error);
