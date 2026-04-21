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
