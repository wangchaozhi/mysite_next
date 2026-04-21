import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import RichTextEditor from "@/components/rich-text-editor";
import { isLoggedIn } from "@/lib/auth";
import { createPost, deletePost, getPosts } from "@/lib/db";

export const dynamic = "force-dynamic";

function getFirstImageSrc(content: string): string | null {
  const match = content.match(/<img[^>]+src="([^"]+)"/i);
  return match?.[1] ?? null;
}

export default async function BlogPage() {
  const loggedIn = await isLoggedIn();
  const posts = getPosts();

  async function createPostAction(formData: FormData) {
    "use server";

    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      redirect("/blog");
    }

    const title = String(formData.get("title") ?? "").trim();
    const contentHtml = String(formData.get("content_html") ?? "").trim();

    const safeContent = sanitizeHtml(contentHtml, {
      allowedTags: [
        "p",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "strong",
        "em",
        "blockquote",
        "br",
        "a",
        "img",
        "u",
        "s",
        "pre",
        "code",
        "hr",
      ],
      allowedAttributes: {
        p: ["style"],
        h2: ["style"],
        h3: ["style"],
        a: ["href", "target", "rel"],
        img: ["src", "alt"],
      },
      allowedSchemes: ["http", "https", "data"],
      allowedStyles: {
        "*": {
          "text-align": [/^left$/, /^center$/, /^right$/],
        },
      },
    });

    const coverImage = getFirstImageSrc(safeContent);
    const plainText = safeContent.replace(/<[^>]*>/g, "").trim();
    if (!title || (!plainText && !coverImage)) {
      redirect("/blog");
    }

    createPost(title, safeContent, coverImage);
    revalidatePath("/blog");
    redirect("/blog");
  }

  async function deletePostAction(formData: FormData) {
    "use server";

    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      redirect("/blog");
    }

    const postId = Number(formData.get("post_id"));
    if (!Number.isInteger(postId) || postId <= 0) {
      redirect("/blog");
    }

    deletePost(postId);
    revalidatePath("/blog");
    revalidatePath(`/blog/${postId}`);
    redirect("/blog");
  }

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="hero-card rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.7fr)] lg:items-end">
          <div>
            <p className="eyebrow">Journal Archive</p>
            <h1 className="display-title mt-4 text-4xl leading-tight sm:text-5xl">
              博客与图文记录
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-700)] sm:text-lg">
              这里收纳所有公开文章。它们可能是技术笔记、生活观察，也可能只是某天突然很想留下的一段话。
            </p>
          </div>

          <div className="section-card rounded-[1.5rem] p-5 text-sm leading-7 text-[var(--ink-700)]">
            <p className="eyebrow">Overview</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-semibold text-[var(--ink-950)]">{posts.length}</p>
                <p>已发布文章</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--ink-950)]">
                  {loggedIn ? "已登录" : "访客"}
                </p>
                <p>当前状态</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loggedIn ? (
        <section className="section-card rounded-[1.75rem] p-5 sm:p-7">
          <div className="mb-6 flex flex-col gap-2">
            <p className="eyebrow">Editor</p>
            <h2 className="display-title text-2xl sm:text-3xl">发布一篇新的图文文章</h2>
          </div>

          <form action={createPostAction} className="flex flex-col gap-5">
            <input
              type="text"
              name="title"
              required
              maxLength={120}
              className="min-h-12 rounded-2xl border border-[rgba(83,72,56,0.12)] bg-white/80 px-4 py-3 text-base outline-none focus:border-[var(--accent-500)] focus:bg-white"
              placeholder="输入文章标题"
            />
            <RichTextEditor name="content_html" />
            <button type="submit" className="primary-button w-full sm:w-fit">
              发布文章
            </button>
          </form>
        </section>
      ) : null}

      <section className="grid gap-6">
        {posts.length === 0 ? (
          <article className="section-card rounded-[1.75rem] p-8 text-[var(--ink-700)]">
            还没有文章。登录后台后，发布第一篇内容吧。
          </article>
        ) : (
          posts.map((post, index) => (
            <article
              key={post.id}
              className="section-card grid overflow-hidden rounded-[1.75rem] lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]"
            >
              <div className="p-6 sm:p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-500)]">
                  Note {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="display-title mt-4 text-2xl leading-tight text-[var(--ink-950)] sm:text-3xl">
                  <Link className="hover:text-[var(--accent-600)]" href={`/blog/${post.id}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm text-[var(--ink-500)]">{post.created_at}</p>
                <div
                  className="prose prose-sm mt-5 max-w-none text-[var(--ink-700)] sm:prose-base"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link className="soft-button" href={`/blog/${post.id}`}>
                    阅读全文
                  </Link>
                  {loggedIn ? (
                    <form action={deletePostAction}>
                      <input type="hidden" name="post_id" value={post.id} />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(174,86,36,0.28)] bg-white/70 px-4 py-2 text-sm text-[var(--accent-600)] shadow-[0_10px_28px_rgba(83,60,40,0.08)] hover:bg-white hover:text-[var(--ink-950)]"
                      >
                        删除
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>

              <div className="hidden min-h-[220px] items-stretch bg-[rgba(255,255,255,0.45)] lg:flex">
                {post.image_url ? (
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    width={1200}
                    height={900}
                    sizes="(max-width: 1024px) 100vw, 36vw"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex w-full flex-col justify-between bg-[linear-gradient(145deg,rgba(196,109,60,0.12),rgba(83,72,56,0.08))] p-6">
                    <span className="eyebrow">Excerpt</span>
                    <p className="display-title text-2xl leading-snug text-[var(--ink-950)]">
                      没有配图的文章，也应该有留白与呼吸感。
                    </p>
                    <span className="text-sm text-[var(--ink-500)]">Clean layout for text-first notes</span>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
