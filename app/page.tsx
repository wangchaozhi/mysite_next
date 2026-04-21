export default function Home() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="hero-card overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] lg:items-end">
          <div className="space-y-6">
            <p className="eyebrow">A Quiet Corner On The Web</p>
            <div className="space-y-4">
              <h1 className="display-title max-w-3xl text-4xl leading-tight sm:text-5xl lg:text-6xl">
                把一寸光阴写慢，把一阵清风留下。
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--ink-700)] sm:text-lg">
                山色不必远行才有，安静也不必等到深夜。愿这里像一张温柔的纸，
                收住途中的微光、雨后的气息，以及那些忽然被生活照亮的句子。
              </p>
            </div>
          </div>

          <aside className="section-card rounded-[1.75rem] p-6">
            <p className="eyebrow">Small Chapters</p>
            <div className="mt-5 space-y-5 text-sm leading-7 text-[var(--ink-700)]">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-500)]">
                  01
                </p>
                <p className="mt-2">
                  晨光落在窗沿，尘埃也有了方向；人间的清醒，常从一杯热茶开始。
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-500)]">
                  02
                </p>
                <p className="mt-2">
                  风经过树梢，没有留下姓名，却把夏天翻成了另一页。
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-500)]">
                  03
                </p>
                <p className="mt-2">
                  慢慢走的人，也会抵达；只是他把路上的花影，都认真看了一遍。
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="section-card rounded-[1.75rem] p-6 lg:col-span-2">
          <p className="eyebrow">A Gentle Essay</p>
          <h2 className="display-title mt-4 text-2xl sm:text-3xl">
            愿每一次回望，都有柔软的灯火。
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[var(--ink-700)]">
            生活并不总是盛大的，它更多时候藏在细小处：一朵云的停留，一条街的黄昏，
            一个人在忙碌之后忽然安静下来的瞬间。把这些写下来，不是为了抵抗遗忘，
            而是为了在日后某个普通的夜晚，仍能听见当时心里的风声。
          </p>
        </article>

        <article className="section-card rounded-[1.75rem] p-6">
          <p className="eyebrow">Read Slowly</p>
          <p className="mt-5 text-sm leading-7 text-[var(--ink-700)]">
            从上方菜单进入博客，读一些短章，也读一些长句。愿文字像一条小径，
            不急着抵达，只陪你把片刻走深。
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
