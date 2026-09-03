// scripts/optimize-images.ts
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function optimizeUploadsDirectory() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    console.log("No uploads directory found at", uploadsDir);
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`Found ${files.length} files in /public/uploads`);

  for (const filename of files) {
    const fullPath = path.join(uploadsDir, filename);
    const stat = fs.statSync(fullPath);

    // Only process files larger than 120KB or non-webp images
    if (stat.size > 120 * 1024) {
      console.log(`Optimizing heavy image: ${filename} (${(stat.size / 1024 / 1024).toFixed(2)} MB)...`);
      try {
        const buffer = fs.readFileSync(fullPath);
        const ext = path.extname(filename).toLowerCase();

        let optimizedBuffer: Buffer;
        if (ext === ".png") {
          optimizedBuffer = await sharp(buffer)
            .rotate()
            .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
            .png({ quality: 80, compressionLevel: 8 })
            .toBuffer();
        } else {
          // jpg, jpeg, webp
          optimizedBuffer = await sharp(buffer)
            .rotate()
            .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 80, mozjpeg: true })
            .toBuffer();
        }

        // Only overwrite if it actually saved space
        if (optimizedBuffer.length < stat.size) {
          fs.writeFileSync(fullPath, optimizedBuffer);
          console.log(
            `✓ Reduced ${filename}: ${(stat.size / 1024).toFixed(1)} KB -> ${(optimizedBuffer.length / 1024).toFixed(1)} KB`
          );
        }
      } catch (err) {
        console.error(`Error optimizing ${filename}:`, err);
      }
    }
  }
}

async function optimizeDatabaseImages() {
  console.log("Checking database product images for oversized base64 strings...");
  const products = await prisma.product.findMany();

  for (const product of products) {
    let rawImages: any = product.images;
    if (typeof rawImages === "string") {
      try {
        rawImages = JSON.parse(rawImages);
      } catch {
        rawImages = [rawImages];
      }
    }

    if (Array.isArray(rawImages)) {
      let changed = false;
      const optimizedImages: string[] = [];

      for (const img of rawImages) {
        if (typeof img === "string" && img.startsWith("data:image/") && img.length > 50000) {
          console.log(`Product #${product.id} (${product.name}) has heavy base64 image (${(img.length / 1024).toFixed(1)} KB)`);
          try {
            const matches = img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches[2]) {
              const buffer = Buffer.from(matches[2], "base64");
              const compressed = await sharp(buffer)
                .rotate()
                .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

              const compressedDataUri = `data:image/webp;base64,${compressed.toString("base64")}`;
              console.log(`✓ Compressed base64: ${(img.length / 1024).toFixed(1)} KB -> ${(compressedDataUri.length / 1024).toFixed(1)} KB`);
              optimizedImages.push(compressedDataUri);
              changed = true;
              continue;
            }
          } catch (e) {
            console.error("Failed to compress base64 image:", e);
          }
        }
        optimizedImages.push(img);
      }

      if (changed) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: optimizedImages },
        });
        console.log(`Updated product #${product.id} with compressed images.`);
      }
    }
  }
}

async function main() {
  console.log("=== ENMAR High-Performance Image Optimization ===");
  await optimizeUploadsDirectory();
  await optimizeDatabaseImages();
  console.log("=== Optimization Complete ===");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Optimization failed:", err);
  process.exit(1);
});
