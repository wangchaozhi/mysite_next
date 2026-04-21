import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type Params = Promise<{ filename: string }>;

const contentTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_: Request, props: { params: Params }) {
  const { filename } = await props.params;
  const safeFilename = path.basename(filename);

  if (safeFilename !== filename) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const extension = path.extname(safeFilename).toLowerCase();
  const contentType = contentTypes[extension];

  if (!contentType) {
    return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
  }

  const filepath = path.join(process.cwd(), "public", "uploads", safeFilename);

  try {
    const file = await fs.readFile(filepath);
    return new NextResponse(file, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType,
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
