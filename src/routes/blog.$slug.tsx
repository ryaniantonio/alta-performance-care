import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { ArrowLeft } from "lucide-react";
import { getPost, posts } from "@/content/posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return { meta: [{ title: "Artigo não encontrado" }] };
    }
    return {
      meta: [
        { title: `${post.title} · Blog Ryani Antonio` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:image", content: post.image },
      ],
      links: [{ rel: "canonical", href: `/blog/${post.slug}` }],
    };
  },
  component: BlogPost,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pt-40 pb-20 text-center">
        <h1 className="font-display text-3xl">Artigo não encontrado</h1>
        <Link to="/blog" className="mt-6 inline-block text-accent">
          ← Voltar ao blog
        </Link>
      </main>
      <Footer />
    </div>
  ),
});

function BlogPost() {
  const { post } = Route.useLoaderData();
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <article className="mx-auto max-w-3xl px-5 pt-32 pb-12 sm:px-8 sm:pt-40">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="size-4" /> Voltar ao blog
          </Link>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            {post.category} · {post.readingTime}
          </p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>

          <div className="mt-10 aspect-[16/10] overflow-hidden rounded-2xl shadow-card">
            <img
              src={post.image}
              alt={post.title}
              className="size-full object-cover"
              width={1280}
              height={800}
            />
          </div>

          <div className="mt-12 space-y-6">
            {post.body.map((block, i) => (
              <div key={i}>
                {block.heading && (
                  <h2 className="mt-8 font-display text-2xl text-foreground">
                    {block.heading}
                  </h2>
                )}
                <p className="mt-3 text-base leading-relaxed text-foreground/85">
                  {block.paragraph}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-border bg-secondary/50 p-8 text-center">
            <p className="font-display text-2xl text-foreground">
              Quer aplicar isso ao seu caso?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Cada plano é construído a partir da sua história, exames e objetivos.
            </p>
            <div className="mt-6 flex justify-center">
              <WhatsAppButton
                message={`Olá Ryani! Li o artigo "${post.title}" e gostaria de agendar uma consulta.`}
                size="lg"
              >
                Agendar Consulta
              </WhatsAppButton>
            </div>
          </div>
        </article>

        <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <p className="text-xs uppercase tracking-[0.22em] text-accent">
            Leituras relacionadas
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {related.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group flex gap-5 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-premium"
              >
                <div className="aspect-square w-28 shrink-0 overflow-hidden rounded-xl">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {p.category}
                  </span>
                  <p className="mt-2 font-display text-base leading-snug text-foreground group-hover:text-primary">
                    {p.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}