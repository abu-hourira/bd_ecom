// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const fileList: File[] = [];
    if (singleFile) fileList.push(singleFile);
    if (files && files.length > 0) {
      files.forEach((f) => {
        if (f && !fileList.includes(f)) fileList.push(f);
      });
    }

    if (fileList.length === 0) {
      return NextResponse.json({ error: "No files provided for upload." }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

    for (const file of fileList) {
      const bytes = await file.arrayBuffer();
      const rawBuffer = Buffer.from(bytes);

      // High-performance WebP compression with Sharp (max 1200px, quality 82)
      let compressedBuffer: Buffer;
      try {
        compressedBuffer = await sharp(rawBuffer)
          .rotate() // Auto-orient from EXIF
          .resize({
            width: 1200,
            height: 1200,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 82, effort: 4 })
          .toBuffer();
      } catch (sharpErr) {
        console.warn("[Upload Sharp Fallback]:", sharpErr);
        compressedBuffer = rawBuffer;
      }

      const cleanBase = path
        .basename(file.name, path.extname(file.name))
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 30);
      const uniqueName = `${cleanBase}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.webp`;

      // 1. If on persistent disk (cPanel, VPS, Docker, Windows, Linux)
      if (!isVercel) {
        try {
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          await mkdir(uploadDir, { recursive: true });
          const filePath = path.join(uploadDir, uniqueName);

          await writeFile(filePath, compressedBuffer);
          uploadedUrls.push(`/uploads/${uniqueName}`);
          continue;
        } catch (diskErr) {
          console.warn("[Upload Disk Write Fallback to Data URI]:", diskErr);
        }
      }

      // 2. Fallback to compact WebP Data URI for read-only serverless
      const base64Data = `data:image/webp;base64,${compressedBuffer.toString("base64")}`;
      uploadedUrls.push(base64Data);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0],
      count: uploadedUrls.length,
    });
  } catch (error: any) {
    console.error("[Upload API Error]:", error);
    return NextResponse.json(
      { error: "Failed to upload image: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
