export default function Home() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="hero-card overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] lg:items-end">
          <div className="space-y-6">
            <p className="eyebrow">A Quiet Corner On The Web</p>
            <div className="space-y-4">
              <h1 className="display-title max-w-3xl text-4xl leading-tight sm:text-5xl lg:text-6xl">
                把学习、灵感与生活碎片，认真地排成一页页好看的文章。
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--ink-700)] sm:text-lg">
                这里是我的个人站点，也是一个轻量博客。写代码、写随想、写日常，偶尔配上一张图片，
                让每次记录都像一本正在慢慢成形的纸质杂志。
              </p>
            </div>
          </div>

          <aside className="section-card rounded-[1.75rem] p-6">
            <p className="eyebrow">Site Notes</p>
            <div className="mt-5 space-y-5 text-sm leading-7 text-[var(--ink-700)]">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-500)]">
                  01
                </p>
                <p className="mt-2">博客支持富文本编辑与插图，适合写图文并茂的长文。</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-500)]">
                  02
                </p>
                <p className="mt-2">内容保存在本地 SQLite，轻量、直接，也很适合个人项目。</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-500)]">
                  03
                </p>
                <p className="mt-2">整个站点现在是温暖纸张感的视觉方向，更像作品集而不是默认模板。</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="section-card rounded-[1.75rem] p-6 lg:col-span-2">
          <p className="eyebrow">Why I Write</p>
          <h2 className="display-title mt-4 text-2xl sm:text-3xl">把零散念头，做成能回看的内容。</h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[var(--ink-700)]">
            不是为了堆积信息，而是为了让思考留下结构。每篇文章都可以是一次总结、一次实验记录，
            或者一次对生活细节的认真观察。
          </p>
        </article>

        <article className="section-card rounded-[1.75rem] p-6">
          <p className="eyebrow">Start Here</p>
          <p className="mt-5 text-sm leading-7 text-[var(--ink-700)]">
            从上方导航进入博客即可阅读内容，后台入口改为通过 `/admin` 访问，不再在首页直接展示。
          </p>
        </article>
      </section>

      <footer className="mt-8 pb-2 pt-10 text-center text-sm text-[var(--ink-500)] sm:mt-12 sm:pt-14">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-[var(--ink-950)]"
        >
          湘ICP备2024092326号
        </a>
      </footer>
    </main>
  );
}
