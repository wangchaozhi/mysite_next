import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import Database from "better-sqlite3";

export type Post = {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

export type Comment = {
  id: number;
  post_id: number;
  author_name: string;
  content: string;
  client_ip: string;
  created_at: string;
};

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "blog.sqlite");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    client_ip TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS commenter_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_ip TEXT NOT NULL UNIQUE,
    author_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const columns = db.prepare("PRAGMA table_info(posts)").all() as Array<{ name: string }>;
const hasImageUrl = columns.some((column) => column.name === "image_url");
if (!hasImageUrl) {
  db.exec("ALTER TABLE posts ADD COLUMN image_url TEXT");
}

const commentColumns = db.prepare("PRAGMA table_info(comments)").all() as Array<{ name: string }>;
const hasClientIp = commentColumns.some((column) => column.name === "client_ip");
if (!hasClientIp) {
  db.exec("ALTER TABLE comments ADD COLUMN client_ip TEXT NOT NULL DEFAULT ''");
}

const nicknameAdjectives = [
  "青杉",
  "远山",
  "海风",
  "晨光",
  "松影",
  "流云",
  "星河",
  "长街",
];

const nicknameNouns = [
  "旅人",
  "读者",
  "来客",
  "笔友",
  "行者",
  "听风者",
  "拾光者",
  "观察员",
];

function createNicknameFromIp(clientIp: string): string {
  const hash = crypto.createHash("sha256").update(clientIp).digest("hex");
  const adjectiveIndex = parseInt(hash.slice(0, 2), 16) % nicknameAdjectives.length;
  const nounIndex = parseInt(hash.slice(2, 4), 16) % nicknameNouns.length;
  const suffix = parseInt(hash.slice(4, 8), 16).toString().slice(-4).padStart(4, "0");

  return `${nicknameAdjectives[adjectiveIndex]}${nicknameNouns[nounIndex]}${suffix}`;
}

export function previewCommentAuthorNameByIp(clientIp: string): string {
  return createNicknameFromIp(clientIp);
}

export function getPosts(): Post[] {
  return db
    .prepare("SELECT id, title, content, image_url, created_at FROM posts ORDER BY id DESC")
    .all() as Post[];
}

export function createPost(title: string, content: string, imageUrl: string | null): void {
  db.prepare("INSERT INTO posts (title, content, image_url) VALUES (?, ?, ?)").run(
    title,
    content,
    imageUrl
  );
}

function getUploadUrl(value: string): string | null {
  try {
    const url = value.startsWith("/") ? new URL(value, "http://local.test") : new URL(value);
    if (url.pathname.startsWith("/uploads/")) {
      return url.pathname;
    }
  } catch {
    if (value.startsWith("/uploads/")) {
      return value.split(/[?#]/)[0] ?? value;
    }
  }

  return null;
}

function getUploadUrlsFromContent(content: string): string[] {
  const matches = content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
  const urls = new Set<string>();

  for (const match of matches) {
    const uploadUrl = getUploadUrl(match[1] ?? "");
    if (uploadUrl) {
      urls.add(uploadUrl);
    }
  }

  return Array.from(urls);
}

function isUploadUrlReferencedByOtherPosts(uploadUrl: string, deletedPostId: number): boolean {
  const row = db
    .prepare(
      `
        SELECT 1
        FROM posts
        WHERE id != ?
          AND (image_url = ? OR content LIKE ?)
        LIMIT 1
      `
    )
    .get(deletedPostId, uploadUrl, `%${uploadUrl}%`);

  return Boolean(row);
}

function deleteUploadFile(uploadUrl: string): void {
  const filename = path.basename(uploadUrl);
  const filepath = path.join(process.cwd(), "public", "uploads", filename);

  if (path.dirname(filepath) !== path.join(process.cwd(), "public", "uploads")) {
    return;
  }

  try {
    fs.unlinkSync(filepath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

export function deletePost(id: number): void {
  const post = getPostById(id);
  if (!post) {
    return;
  }

  const uploadUrls = new Set(getUploadUrlsFromContent(post.content));
  if (post.image_url) {
    const uploadUrl = getUploadUrl(post.image_url);
    if (uploadUrl) {
      uploadUrls.add(uploadUrl);
    }
  }

  const deletePostWithComments = db.transaction((postId: number) => {
    db.prepare("DELETE FROM comments WHERE post_id = ?").run(postId);
    db.prepare("DELETE FROM posts WHERE id = ?").run(postId);
  });

  deletePostWithComments(id);

  for (const uploadUrl of uploadUrls) {
    if (!isUploadUrlReferencedByOtherPosts(uploadUrl, id)) {
      deleteUploadFile(uploadUrl);
    }
  }
}

export function getPostById(id: number): Post | undefined {
  return db
    .prepare("SELECT id, title, content, image_url, created_at FROM posts WHERE id = ?")
    .get(id) as Post | undefined;
}

export function getCommentsByPostId(postId: number): Comment[] {
  return db
    .prepare(
      `
        SELECT id, post_id, author_name, content, client_ip, created_at
        FROM comments
        WHERE post_id = ?
        ORDER BY id DESC
      `
    )
    .all(postId) as Comment[];
}

export function getCommentAuthorNameByIp(clientIp: string): string | undefined {
  const row = db
    .prepare("SELECT author_name FROM commenter_profiles WHERE client_ip = ?")
    .get(clientIp) as { author_name: string } | undefined;

  return row?.author_name;
}

export function getOrCreateCommentAuthorNameByIp(clientIp: string): string {
  const existingAuthorName = getCommentAuthorNameByIp(clientIp);
  if (existingAuthorName) {
    return existingAuthorName;
  }

  const authorName = createNicknameFromIp(clientIp);
  db.prepare("INSERT INTO commenter_profiles (client_ip, author_name) VALUES (?, ?)").run(
    clientIp,
    authorName
  );

  return authorName;
}

export function createComment(postId: number, clientIp: string, content: string): void {
  const authorName = getOrCreateCommentAuthorNameByIp(clientIp);

  db.prepare("INSERT INTO comments (post_id, author_name, content, client_ip) VALUES (?, ?, ?, ?)").run(
    postId,
    authorName,
    content,
    clientIp
  );
}
