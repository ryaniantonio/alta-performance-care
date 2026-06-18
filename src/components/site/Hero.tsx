import { Link } from "@tanstack/react-router";
import { ArrowRight, Baby, Activity } from "lucide-react";
import heroPortrait from "@/assets/ryani-hero.jpg.asset.json";
import { WhatsAppButton } from "./WhatsAppButton";
import { SITE } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* decorative blur */}
      <div className="pointer-events-none absolute -top-32 -right-24 size-[420px] rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 size-[460px] rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="reveal is-visible">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-accent" />
            {SITE.crn} · Nutricionista
          </span>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            Nutrição de alta complexidade{" "}
            <span className="italic text-primary">e performance</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg whitespace-pre-line">
            Ciência de ponta, cuidado e acolhimento humanizado para guiar a sua
            saúde, a sua evolução estética ou a nutrição do seu filho — com o
            rigor técnico baseado em evidências{"\n"}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <WhatsAppButton
              message="Olá Ryani! Gostaria de agendar uma consulta."
              size="lg"
            >
              Agendar Consulta
            </WhatsAppButton>
            <Link
              to="/"
              hash="especialidades"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
            >
              Ver especialidades
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="relative reveal is-visible">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-primary/20 via-transparent to-accent/30 blur-2xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-premium ring-1 ring-foreground/5">
            <img
              src={heroPortrait.url}
              alt={`Retrato profissional da nutricionista ${SITE.name}`}
              className="size-full object-cover"
              width={896}
              height={1152}
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-background/95 px-5 py-4 shadow-card backdrop-blur sm:block">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Residência hospitalar</p>
            <p className="mt-1 font-display text-2xl text-primary">2 anos</p>
            <p className="text-xs text-muted-foreground">Urgência e emergência pediátrica</p>
          </div>
        </div>
      </div>

      {/* Dual audience cards */}
      <div className="relative mx-auto mt-16 grid max-w-6xl gap-4 px-5 sm:mt-20 sm:px-8 md:grid-cols-2">
        <Link
          to="/"
          hash="especialidades"
          className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-premium sm:p-7"
        >
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Activity className="size-6" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-accent">Para você</p>
              <h3 className="mt-1 font-display text-xl text-foreground">
                Atendimento Adulto: Clínica e Esporte
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Avaliação antropométrica do adulto e do idoso, avaliação nutricional, composição corporal, performance, emagrecimento e avaliação nutricional clínica baseada em exames.
              </p>
            </div>
          </div>
          <ArrowRight className="absolute right-6 top-6 size-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
        </Link>

        <Link
          to="/"
          hash="especialidades"
          className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-premium sm:p-7"
        >
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Baby className="size-6" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-primary">Para o seu filho</p>
              <h3 className="mt-1 font-display text-xl text-foreground">
                Nutrição Pediátrica Especializada
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Introdução alimentar segura, avaliação antropométrica, avaliação nutricional, seletividade alimentar, alergias, dietoterapia enteral especializada e suporte pós-alta hospitalar.
              </p>
            </div>
          </div>
          <ArrowRight className="absolute right-6 top-6 size-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
        </Link>
      </div>
    </section>
  );
}