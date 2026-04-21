import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";

const allowedTypes = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(request: Request) {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const extension = allowedTypes.get(file.type) ?? "png";
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, filename);
  const bytes = await file.arrayBuffer();
  await fs.writeFile(filepath, Buffer.from(bytes));

  return NextResponse.json({ url: `/uploads/${filename}` });
}
