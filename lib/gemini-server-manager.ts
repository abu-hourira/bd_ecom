// lib/gemini-server-manager.ts - Server-side only Gemini Web2API process manager

let isStarting = false;
let lastCheckTime = 0;
let isHealthy = false;

/**
 * Check if the local Gemini Web2API Python server is running on port 8081
 */
export async function isGeminiServerAlive(): Promise<boolean> {
  const now = Date.now();
  if (now - lastCheckTime < 5000 && isHealthy) {
    return true;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch("http://127.0.0.1:8081/v1/models", {
      method: "GET",
      headers: { Authorization: "Bearer sk-gemini" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      lastCheckTime = now;
      isHealthy = true;
      return true;
    }
    isHealthy = false;
    return false;
  } catch {
    isHealthy = false;
    return false;
  }
}

/**
 * Automatically boot and supervise the Gemini Web2API Python server if not already running
 */
export async function ensureGeminiServerRunning(): Promise<boolean> {
  if (typeof window !== "undefined") return false;

  if (await isGeminiServerAlive()) {
    return true;
  }

  if (isStarting) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return isGeminiServerAlive();
  }

  isStarting = true;

  try {
    // Dynamic node require to prevent Webpack bundling in client components
    const { spawn } = require("child_process");
    const path = require("path");
    const fs = require("fs");

    const rootDir = process.cwd();
    const scriptPath = path.join(rootDir, "gemini", "gemini_web2api.py");
    const configPath = path.join(rootDir, "gemini", "config.json");
    const cookieDir = path.join(rootDir, "gemini", "cookies");

    if (!fs.existsSync(scriptPath)) {
      console.warn("[Gemini Server] script not found at:", scriptPath);
      isStarting = false;
      return false;
    }

    console.log("[Gemini Server Manager] Auto-launching Python AI server on port 8081...");

    const pythonCmd = process.platform === "win32" ? "python" : "python3";
    const child = spawn(
      pythonCmd,
      [scriptPath, "--config", configPath, "--cookie-dir", cookieDir],
      {
        cwd: rootDir,
        detached: true,
        stdio: "ignore",
        shell: false,
      }
    );

    child.unref();

    for (let i = 0; i < 8; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (await isGeminiServerAlive()) {
        console.log("✅ [Gemini Server Manager] Local Python AI server is online & healthy!");
        isStarting = false;
        return true;
      }
    }
  } catch (err) {
    console.error("[Gemini Server Manager] Failed to launch background server:", err);
  } finally {
    isStarting = false;
  }

  return isGeminiServerAlive();
}
