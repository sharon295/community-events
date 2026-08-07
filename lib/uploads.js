import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

// Lives under data/ (not public/) so a single persistent disk mounted at
// data/ covers uploaded banner images on a host like Render, the same
// pattern used by the member directory app.
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB input cap, before resize/compress

export async function saveUploadedImage(file) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported file type. Please upload a JPG, PNG, WEBP, or GIF image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File is too large. Please upload an image under 8MB.");
  }
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  // Resize/compress server-side: cap width at 1600px and re-encode as
  // webp so banner images stay small regardless of what was uploaded.
  const outputBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const filename = `${randomUUID()}.webp`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), outputBuffer);
  return `/api/uploads/${filename}`;
}

export function deleteUploadedImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/api/uploads/")) return;
  const filename = imageUrl.replace("/api/uploads/", "");
  if (!/^[a-zA-Z0-9-]+\.(jpe?g|png|webp|gif)$/.test(filename)) return;
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
