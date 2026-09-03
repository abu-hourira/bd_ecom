// app/api/admin/ai/cookies/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ensureGeminiServerRunning } from "@/lib/gemini-server-manager";

const COOKIES_DIR = path.join(process.cwd(), "gemini", "cookies");

function ensureCookiesDir() {
  if (!fs.existsSync(COOKIES_DIR)) {
    fs.mkdirSync(COOKIES_DIR, { recursive: true });
  }
}

/**
 * GET /api/admin/ai/cookies - List all configured Gemini cookie accounts
 */
export async function GET() {
  try {
    ensureCookiesDir();
    const files = fs.readdirSync(COOKIES_DIR).filter((f) => f.endsWith(".json") || f.endsWith(".txt"));

    const accounts = files.map((fileName, index) => {
      const filePath = path.join(COOKIES_DIR, fileName);
      const stat = fs.statSync(filePath);
      let preview = "";
      let hasPsid = false;
      let hasPsidts = false;

      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        if (raw.includes("__Secure-1PSID")) hasPsid = true;
        if (raw.includes("__Secure-1PSIDTS")) hasPsidts = true;

        if (raw.startsWith("{")) {
          const parsed = JSON.parse(raw);
          const c = parsed.cookie || "";
          preview = c.slice(0, 45) + "...";
        } else {
          preview = raw.slice(0, 45) + "...";
        }
      } catch {
        preview = "Invalid format";
      }

      return {
        id: fileName,
        fileName,
        name: `Account ${index + 1} (${fileName.replace(/\.(json|txt)$/, "")})`,
        sizeBytes: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        hasPsid,
        hasPsidts,
        preview,
      };
    });

    return NextResponse.json({
      success: true,
      totalAccounts: accounts.length,
      accounts,
      cookiesDir: COOKIES_DIR,
    });
  } catch (err: any) {
    console.error("[Get Cookies Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/ai/cookies - Add a new cookie account or update an existing one
 */
export async function POST(req: NextRequest) {
  try {
    ensureCookiesDir();
    const body = await req.json();
    let { fileName, rawCookie, accountName } = body;

    if (!rawCookie || typeof rawCookie !== "string" || !rawCookie.trim()) {
      return NextResponse.json(
        { error: "Cookie content is required. Please paste your cookie string or JSON." },
        { status: 400 }
      );
    }

    rawCookie = rawCookie.trim();

    // Determine target filename
    if (!fileName || typeof fileName !== "string" || !fileName.trim()) {
      const safeName = (accountName || "account")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_");
      
      const existing = fs.readdirSync(COOKIES_DIR);
      let count = existing.length + 1;
      let candidate = `${safeName || "account"}_${count}.json`;
      while (existing.includes(candidate)) {
        count++;
        candidate = `${safeName || "account"}_${count}.json`;
      }
      fileName = candidate;
    } else {
      // Clean filename
      if (!fileName.endsWith(".json")) fileName += ".json";
      fileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
    }

    let fileContent = "";

    // 1. If user pasted JSON array from Cookie-Editor extension
    if (rawCookie.startsWith("[") && rawCookie.endsWith("]")) {
      try {
        const cookieArray = JSON.parse(rawCookie);
        if (Array.isArray(cookieArray)) {
          const cookieStr = cookieArray
            .filter((c: any) => c.name && c.value)
            .map((c: any) => `${c.name}=${c.value}`)
            .join("; ");
          fileContent = JSON.stringify(
            {
              cookie: cookieStr,
              auth_user: null,
            },
            null,
            2
          );
        }
      } catch {
        // fallback to standard json
      }
    }

    // 2. If user pasted a JSON object { cookie: "..." }
    if (!fileContent && rawCookie.startsWith("{") && rawCookie.endsWith("}")) {
      try {
        const parsed = JSON.parse(rawCookie);
        if (parsed.cookie) {
          fileContent = JSON.stringify(parsed, null, 2);
        }
      } catch {
        // fallback
      }
    }

    // 3. If user pasted standard Cookie string (e.g. __Secure-1PSID=...; __Secure-1PSIDTS=...;)
    if (!fileContent) {
      let finalCookieStr = rawCookie;
      if (!finalCookieStr.includes("=")) {
        finalCookieStr = `__Secure-1PSID=${finalCookieStr};`;
      }
      fileContent = JSON.stringify(
        {
          cookie: finalCookieStr,
          auth_user: null,
        },
        null,
        2
      );
    }

    const targetPath = path.join(COOKIES_DIR, fileName);
    fs.writeFileSync(targetPath, fileContent, "utf-8");

    // Ensure server is refreshed/running
    await ensureGeminiServerRunning().catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Cookie account saved successfully as ${fileName}`,
      fileName,
    });
  } catch (err: any) {
    console.error("[Save Cookie Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/ai/cookies - Delete a cookie account
 */
export async function DELETE(req: NextRequest) {
  try {
    ensureCookiesDir();
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      return NextResponse.json({ error: "fileName parameter is required" }, { status: 400 });
    }

    const safeFileName = path.basename(fileName);
    const filePath = path.join(COOKIES_DIR, safeFileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({
        success: true,
        message: `Account ${safeFileName} deleted successfully.`,
      });
    }

    return NextResponse.json({ error: "Cookie file not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
