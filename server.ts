import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cookieParser from "cookie-parser";

dotenv.config();

console.log("[Server] Starting with NODE_ENV:", process.env.NODE_ENV);
console.log("[Server] Port configured as:", process.env.PORT);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary Configuration
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || "dikxn02y9";
const api_key = process.env.CLOUDINARY_API_KEY || "665566198629512";
const api_secret = process.env.CLOUDINARY_API_SECRET || "bbxn-CliEbDRay2u4lVuJ-vW1q8";

const isGeminiConfigured = !!process.env.GEMINI_API_KEY;
const isCloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) || 
                              (cloud_name === "dikxn02y9" && api_key === "665566198629512");

// Full mode requires Cloudinary configuration
const isFullManagementEnabled = isCloudinaryConfigured;

if (isCloudinaryConfigured) {
  process.env.CLOUDINARY_URL = `cloudinary://${api_key}:${api_secret}@${cloud_name}`;
  cloudinary.config({ cloud_name, api_key, api_secret });
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "textgame-engine",
      format: "png",
      public_id: `img-${Date.now()}`,
    };
  },
});

const upload = multer({ storage });

async function startServer() {
  console.log("[Server] Initializing Express app...");
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.get("/api/images", async (req, res) => {
    if (!isFullManagementEnabled) {
      return res.status(403).json({ error: "Management disabled. Cloudinary configuration is required." });
    }
    try {
      const { resources } = await cloudinary.api.resources({
        type: "upload",
        prefix: "textgame-engine/",
        max_results: 100,
      });
      res.json({ images: resources.map((r: any) => r.secure_url) });
    } catch (error) {
      console.error("Fetch images error:", error);
      res.status(500).json({ error: "Failed to fetch images from Cloudinary. Check API credentials." });
    }
  });

  app.post("/api/upload", (req, res, next) => {
    if (!isFullManagementEnabled) {
      return res.status(403).json({ error: "Upload disabled. Cloudinary configuration is required." });
    }
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.error("Multer/Cloudinary Error:", err);
        return res.status(500).json({ error: err.message || "Upload middleware error" });
      }
      next();
    });
  }, (req, res) => {
    try {
      if (!req.file) {
        console.error("Upload attempt with no file");
        return res.status(400).json({ error: "No file uploaded" });
      }
      res.json({ url: (req.file as any).path });
    } catch (error) {
      console.error("Route handler error:", error);
      res.status(500).json({ error: "Internal server error during upload" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      gemini: isGeminiConfigured,
      cloudinary: isCloudinaryConfigured,
      mode: isFullManagementEnabled ? "full" : "basic"
    });
  });

  app.delete("/api/images/all", async (req, res) => {
    if (!isFullManagementEnabled) {
      return res.status(403).json({ error: "Delete disabled. Cloudinary configuration is required." });
    }
    try {
      // Delete resources by prefix
      const result = await cloudinary.api.delete_resources_by_prefix('textgame-engine/');
      
      res.json({ success: true, result });
    } catch (error) {
      console.error("[Cloudinary] Delete ALL images error:", error);
      res.status(500).json({ error: "Internal server error during bulk delete" });
    }
  });

  app.delete("/api/images", async (req, res) => {
    if (!isFullManagementEnabled) {
      return res.status(403).json({ error: "Delete disabled. Cloudinary configuration is required." });
    }
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: "URL is required" });

      // Robust public_id extraction
      let publicId = "";
      if (url.includes('/upload/')) {
        const splitUrl = url.split('/upload/');
        let pathAfterUpload = splitUrl[1];
        const pathParts = pathAfterUpload.split('/');
        
        // Remove version part (v123456789) if it exists
        if (pathParts[0].startsWith('v') && /^\d+$/.test(pathParts[0].substring(1))) {
          pathParts.shift();
        }
        
        // Join remaining parts and remove extension
        const publicIdWithExt = pathParts.join('/');
        const lastDotIndex = publicIdWithExt.lastIndexOf('.');
        publicId = lastDotIndex !== -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;
      } else {
        // Fallback for non-standard URLs if possible
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        publicId = `${folder}/${lastPart.split('.')[0]}`;
      }

      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok' || result.result === 'not found') {
        res.json({ success: true, result: result.result });
      } else {
        res.status(400).json({ error: "Cloudinary delete failed", result });
      }
    } catch (error) {
      console.error("[Cloudinary] Delete image error:", error);
      res.status(500).json({ error: "Internal server error during delete" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    // Use a middleware for the SPA fallback to avoid path-to-regexp issues in Express 5
    app.use((req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Global Error Handler to prevent HTML responses for API errors
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global Unhandled Error:", err);
    if (req.path.startsWith("/api/")) {
      return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
    next(err);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Matrix Engine running on http://0.0.0.0:${PORT}`);
  });
}

console.log("[Server] Calling startServer()...");
startServer().catch(err => {
  console.error("[Server] Critical failure during startServer():", err);
  process.exit(1);
});
