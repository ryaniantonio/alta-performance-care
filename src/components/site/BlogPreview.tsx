import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { posts } from "@/content/posts";
import { useReveal } from "@/hooks/use-reveal";

export function BlogPreview() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="blog" className="scroll-mt-24 py-20 sm:py-28">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-accent">Insights & artigos</p>
            <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl lg:text-5xl">
              Conteúdo com lastro científico.
            </h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-accent"
          >
            Ver todos os artigos <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {post.category}
                </span>
                <h3 className="mt-3 font-display text-xl leading-tight text-foreground group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.readingTime}</span>
                  <ArrowUpRight className="size-4 text-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-accent" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}