import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ArrowUpRight } from "lucide-react";
import { posts } from "@/content/posts";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog · Ryani Antonio — Nutrição com base científica" },
      {
        name: "description",
        content:
          "Artigos sobre nutrição clínica, esportiva e pediátrica, escritos pela nutricionista Ryani Antonio (CRN-9 29813).",
      },
      { property: "og:title", content: "Blog · Ryani Antonio" },
      {
        property: "og:description",
        content: "Insights sobre antropometria, performance, introdução alimentar e nutrição clínica.",
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pt-32 pb-20 sm:px-8 sm:pt-40">
        <p className="text-xs uppercase tracking-[0.22em] text-accent">Blog</p>
        <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl lg:text-6xl">
          Conteúdo com lastro científico.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Artigos sobre nutrição clínica, performance esportiva e pediatria —
          sem modismos, com referência técnica.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <h2 className="mt-3 font-display text-xl leading-tight text-foreground group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
                <p className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.readingTime}</span>
                  <ArrowUpRight className="size-4 text-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-accent" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}