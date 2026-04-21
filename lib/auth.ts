import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "blog_session";
const password = process.env.BLOG_ADMIN_PASSWORD ?? "admin";
const sessionToken =
  process.env.BLOG_SESSION_TOKEN ??
  crypto.createHash("sha256").update(password).digest("hex");

export async function isLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === sessionToken;
}

export async function login(inputPassword: string): Promise<boolean> {
  if (inputPassword !== password) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
