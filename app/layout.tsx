import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google";
import { redirect } from "next/navigation";
import { logout, isLoggedIn } from "@/lib/auth";
import NavLinks from "@/components/nav-links";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const serifDisplay = Noto_Serif_SC({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "林间手记",
    template: "%s | 林间手记",
  },
  description: "一个带有博客、图文记录与轻量后台发布能力的个人网站。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn = await isLoggedIn();

  async function logoutAction() {
    "use server";
    await logout();
    redirect("/");
  }

  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} ${serifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden font-sans text-[var(--ink-950)]">
        <div className="page-shell">
          <div className="ambient ambient-left" />
          <div className="ambient ambient-right" />
          <header className="sticky top-0 z-20 border-b border-white/55 bg-[color:rgba(247,242,233,0.78)] pt-[env(safe-area-inset-top)] backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 flex-col">
                <span className="font-mono text-[11px] uppercase tracking-[0.42em] text-[var(--ink-500)]">
                  Personal Journal
                </span>
                <span className="font-serif text-lg tracking-[0.18em] text-[var(--ink-950)]">
                  林间手记
                </span>
                <a
                  href="https://github.com/wangchaozhi"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="mt-1 inline-flex size-7 items-center justify-center rounded-full text-[var(--ink-500)] hover:bg-white/70 hover:text-[var(--ink-950)]"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.93.85.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.95.68 1.92 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.15 10.15 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
                  </svg>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <NavLinks />
                {loggedIn ? (
                  <form action={logoutAction}>
                    <button type="submit" className="header-action">
                      退出登录
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </header>
          <div className="relative flex min-h-[calc(100vh-81px)] flex-col">{children}</div>
        </div>
      </body>
    </html>
  );
}
