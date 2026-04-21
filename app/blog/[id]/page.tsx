import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import {
  createComment,
  deletePost,
  getCommentAuthorNameByIp,
  getCommentsByPostId,
  getPostById,
  previewCommentAuthorNameByIp,
} from "@/lib/db";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ comment?: string }>;

function getClientIpFromHeaders(headersList: Headers): string {
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "0.0.0.0";
  }

  return (
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-vercel-forwarded-for") ||
    "0.0.0.0"
  );
}

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { id } = await props.params;
  const post = getPostById(Number(id));

  if (!post) {
    return {
      title: "文章未找到",
    };
  }

  return {
    title: post.title,
    description: post.content.replace(/<[^>]*>/g, "").slice(0, 120),
  };
}

export default async function BlogDetailPage(props: { params: Params; searchParams: SearchParams }) {
  const { id } = await props.params;
  const { comment } = await props.searchParams;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  const post = getPostById(postId);
  if (!post) {
    notFound();
  }

  const loggedIn = await isLoggedIn();
  const headersList = await headers();
  const clientIp = getClientIpFromHeaders(headersList);
  const currentVisitorName =
    getCommentAuthorNameByIp(clientIp) ?? previewCommentAuthorNameByIp(clientIp);
  const comments = getCommentsByPostId(postId);

  async function createCommentAction(targetPostId: number, formData: FormData) {
    "use server";

    const content = String(formData.get("content") ?? "").trim();
    const headersList = await headers();
    const clientIp = getClientIpFromHeaders(headersList);

    if (!content || content.length > 500) {
      redirect(`/blog/${targetPostId}?comment=error#comments`);
    }

    createComment(targetPostId, clientIp, content);
    revalidatePath(`/blog/${targetPostId}`);
    redirect(`/blog/${targetPostId}?comment=success#comments`);
  }

  async function deletePostAction(targetPostId: number) {
    "use server";

    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      redirect(`/blog/${targetPostId}`);
    }

    deletePost(targetPostId);
    revalidatePath("/blog");
    revalidatePath(`/blog/${targetPostId}`);
    redirect("/blog");
  }

  const submitCommentAction = createCommentAction.bind(null, postId);
  const submitDeleteAction = deletePostAction.bind(null, postId);

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className="soft-button" href="/blog">
          返回博客列表
        </Link>
        {loggedIn ? (
          <form action={submitDeleteAction}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(174,86,36,0.28)] bg-white/70 px-4 py-2 text-sm text-[var(--accent-600)] shadow-[0_10px_28px_rgba(83,60,40,0.08)] hover:bg-white hover:text-[var(--ink-950)]"
            >
              删除
            </button>
          </form>
        ) : null}
      </div>

      <article className="hero-card overflow-hidden rounded-[2rem]">
        <div className="border-b border-white/60 px-6 py-8 sm:px-10 sm:py-12">
          <p className="eyebrow">Article</p>
          <h1 className="display-title mt-4 text-3xl leading-tight sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm tracking-[0.12em] text-[var(--ink-500)]">{post.created_at}</p>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div
            className="prose prose-sm max-w-none text-[var(--ink-700)] sm:prose-base md:prose-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>

      <section id="comments" className="section-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-2 border-b border-[rgba(83,72,56,0.08)] pb-6">
          <p className="eyebrow">Guestbook</p>
          <h2 className="display-title text-2xl sm:text-3xl">游客评论</h2>
          <p className="text-sm leading-7 text-[var(--ink-700)]">
            欢迎留下看法。系统会根据你的 IP 自动生成并记住昵称，后续评论会继续沿用同一个名字。
          </p>
        </div>

        <form action={submitCommentAction} className="mt-6 flex flex-col gap-4">
          <div className="rounded-[1.5rem] border border-[rgba(83,72,56,0.08)] bg-white/60 px-4 py-4 text-sm leading-7 text-[var(--ink-700)]">
            当前将以
            <span className="mx-2 inline-flex rounded-full bg-[rgba(31,26,23,0.9)] px-3 py-1 text-sm text-[var(--paper-50)]">
              {currentVisitorName}
            </span>
            的身份评论
          </div>

          <div>
            <textarea
              name="content"
              required
              maxLength={500}
              rows={5}
              className="rounded-2xl border border-[rgba(83,72,56,0.12)] bg-white/85 px-4 py-3 text-base leading-7 outline-none focus:border-[var(--accent-500)] focus:bg-white"
              placeholder="写下你的评论..."
            />
          </div>

          {comment === "success" ? (
            <p className="text-sm text-[var(--accent-600)]">评论已发布，感谢留言。</p>
          ) : null}
          {comment === "error" ? (
            <p className="text-sm text-[var(--accent-600)]">
              提交失败，请确认评论内容已填写，并且长度符合要求。
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs tracking-[0.08em] text-[var(--ink-500)]">
              评论最多 500 个字符。昵称会根据 IP 自动生成并复用。
            </p>
            <button type="submit" className="primary-button">
              提交评论
            </button>
          </div>
        </form>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--ink-950)]">全部评论</h3>
            <p className="text-sm text-[var(--ink-500)]">{comments.length} 条</p>
          </div>

          {comments.length === 0 ? (
            <div className="rounded-[1.5rem] bg-white/55 px-5 py-6 text-sm leading-7 text-[var(--ink-700)]">
              还没有评论，来留下第一条吧。
            </div>
          ) : (
            comments.map((entry) => (
              <article
                key={entry.id}
                className="rounded-[1.5rem] border border-[rgba(83,72,56,0.08)] bg-white/72 px-5 py-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-[var(--ink-950)]">{entry.author_name}</p>
                  <p className="text-xs tracking-[0.08em] text-[var(--ink-500)]">
                    {entry.created_at}
                  </p>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-[15px] leading-8 text-[var(--ink-700)]">
                  {entry.content}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
