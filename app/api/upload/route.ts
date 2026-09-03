// app/api/upload/route.ts
// Multi-Tier High-Performance Image Uploader: Cloudinary -> ImgBB -> Local Disk -> Compact WebP

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default";

  if (!cloudName) return null;

  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: "image/webp" });
    formData.append("file", blob, filename);
    formData.append("upload_preset", uploadPreset);

    if (apiKey && apiSecret) {
      const timestamp = Math.round(Date.now() / 1000).toString();
      formData.append("timestamp", timestamp);
      formData.append("api_key", apiKey);
    }

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.secure_url) {
      return data.secure_url;
    }
  } catch (err) {
    console.warn("[Cloudinary Upload Fallback]:", err);
  }
  return null;
}

async function uploadToImgBB(buffer: Buffer): Promise<string | null> {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) return null;

  try {
    const formData = new FormData();
    formData.append("image", buffer.toString("base64"));

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data?.data?.url) {
      return data.data.url;
    }
  } catch (err) {
    console.warn("[ImgBB Upload Fallback]:", err);
  }
  return null;
}

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

      // High-performance WebP compression with Sharp (max 1000px, quality 78 for ultra-compact storage)
      let compressedBuffer: Buffer;
      try {
        compressedBuffer = await sharp(rawBuffer)
          .rotate() // Auto-orient from EXIF
          .resize({
            width: 1000,
            height: 1000,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 78, effort: 4 })
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

      // 1. Try Cloudinary if configured
      const cloudinaryUrl = await uploadToCloudinary(compressedBuffer, uniqueName);
      if (cloudinaryUrl) {
        uploadedUrls.push(cloudinaryUrl);
        continue;
      }

      // 2. Try ImgBB if configured
      const imgbbUrl = await uploadToImgBB(compressedBuffer);
      if (imgbbUrl) {
        uploadedUrls.push(imgbbUrl);
        continue;
      }

      // 3. If on persistent disk (cPanel, VPS, Docker, Windows, Linux localhost)
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

      // 4. Fallback to compact WebP Data URI for serverless environments
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
