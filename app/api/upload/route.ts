// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

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
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    for (const file of fileList) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Clean file extension & name
      const ext = path.extname(file.name) || ".jpg";
      const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      const uniqueName = `${cleanBase}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/${uniqueName}`);
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
