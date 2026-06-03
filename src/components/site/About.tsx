import aboutImg from "@/assets/ryani-about.jpg.asset.json";
import { useReveal } from "@/hooks/use-reveal";
import { SITE } from "@/lib/site";

export function About() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="sobre" className="scroll-mt-24 bg-secondary/40 py-20 sm:py-28">
      <div
        ref={ref}
        className="reveal mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16"
      >
        <div className="relative order-2 lg:order-1">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/15 to-accent/20 blur-2xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-premium ring-1 ring-foreground/5">
            <img
              src={aboutImg.url}
              alt="Ryani Antonio em ambiente de consultório"
              className="size-full object-cover"
              loading="lazy"
              width={1152}
              height={1280}
            />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-xs uppercase tracking-[0.22em] text-accent">Sobre Ryani Antonio</p>
          <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Da complexidade hospitalar ao consultório
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Dois anos de residência em urgência e emergência pediátrica
              moldaram em mim um rigor técnico inegociável: raciocínio rápido,
              decisão sob pressão e precisão científica. É essa mesma
              intensidade que carrego para o consultório.
            </p>
            <p>
              Hoje, ela serve tanto à mãe que busca segurança na
              introdução alimentar do filho quanto ao adulto que persegue
              hipertrofia, performance ou recuperação de uma condição clínica.
              Cada plano é construído a partir de exames, antropometria
              avançada e histórico individualizado — Não utilizo protocolos genéricos.
            </p>
            <p>
              Acredito que a melhor nutrição é a que une evidência científica,
              escuta humanizada e acolhimento. Esse é o cuidado que ofereço.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
            <div>
              <p className="font-display text-2xl text-primary">2 anos</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Residência</p>
            </div>
            <div>
              <p className="font-display text-2xl text-primary">3</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Pós-graduações</p>
            </div>
            <div>
              <p className="font-display text-2xl text-primary">{SITE.crn}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Registro</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}