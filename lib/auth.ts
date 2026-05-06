import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "blog_session";
const password = process.env.BLOG_ADMIN_PASSWORD?.trim();
const sessionToken =
  process.env.BLOG_SESSION_TOKEN ??
  (password ? crypto.createHash("sha256").update(password).digest("hex") : undefined);

function constantTimeEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export async function isLoggedIn(): Promise<boolean> {
  if (!sessionToken) {
    return false;
  }

  const cookieStore = await cookies();
  const currentToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!currentToken) {
    return false;
  }

  return constantTimeEquals(currentToken, sessionToken);
}

export async function login(inputPassword: string): Promise<boolean> {
  if (!password || !sessionToken || !constantTimeEquals(inputPassword, password)) {
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
