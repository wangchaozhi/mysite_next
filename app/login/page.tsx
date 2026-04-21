import { redirect } from "next/navigation";
import { isLoggedIn, login } from "@/lib/auth";

type SearchParams = Promise<{ error?: string; next?: string }>;

function getSafeNextPath(nextPath?: string): string {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/blog";
  }

  return nextPath;
}

export default async function LoginPage(props: { searchParams: SearchParams }) {
  const { error, next } = await props.searchParams;
  const redirectTo = getSafeNextPath(next);
  const loggedIn = await isLoggedIn();

  if (loggedIn) {
    redirect(redirectTo);
  }

  async function loginAction(formData: FormData) {
    "use server";

    const password = String(formData.get("password") ?? "");
    const next = getSafeNextPath(String(formData.get("next") ?? "/blog"));
    const success = await login(password);

    if (!success) {
      redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
    }

    redirect(next);
  }

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
        <div className="hero-card rounded-[2rem] px-6 py-10 sm:px-10">
          <p className="eyebrow">Admin Access</p>
          <h1 className="display-title mt-4 text-4xl leading-tight sm:text-5xl">
            在安静的后台里，继续为这本线上小刊物添新页。
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--ink-700)] sm:text-lg">
            登录后可以直接进入博客页发布文章，支持富文本和图片上传。这个入口保持克制，但视觉上仍然与整站统一。
          </p>
        </div>

        <section className="section-card w-full rounded-[1.75rem] p-6 sm:p-8">
          <p className="eyebrow">Sign In</p>
          <h2 className="display-title mt-4 text-2xl sm:text-3xl">管理员登录</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-700)]">
            输入后台密码后，将跳转到博客页继续写作。
          </p>

          <form action={loginAction} className="mt-8 flex flex-col gap-4">
            <input type="hidden" name="next" value={redirectTo} />
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="min-h-12 rounded-2xl border border-[rgba(83,72,56,0.12)] bg-white/85 px-4 py-3 text-base outline-none focus:border-[var(--accent-500)] focus:bg-white"
              placeholder="请输入管理员密码"
            />
            {error ? <p className="text-sm text-[var(--accent-600)]">密码错误，请重试。</p> : null}
            <button type="submit" className="primary-button w-full">
              登录
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
