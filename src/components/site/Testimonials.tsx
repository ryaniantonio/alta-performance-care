import { useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { WhatsAppButton } from "./WhatsAppButton";

type Testimonial = {
  name: string;
  role: string;
  rating: number;
  text: string;
  initials: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Mariana Costa",
    role: "Mãe do Theo, 9 meses · Introdução alimentar",
    rating: 5,
    initials: "MC",
    text:
      "A Ryani trouxe segurança numa fase em que eu estava cheia de dúvidas. O plano de introdução alimentar foi claro, baseado em evidências e respeitou o ritmo do meu filho. Hoje ele come de tudo com prazer.",
  },
  {
    name: "Rafael Andrade",
    role: "Atleta amador · Hipertrofia e performance",
    rating: 5,
    initials: "RA",
    text:
      "Em quatro meses ganhei 3,2 kg de massa magra e reduzi 4% de gordura. O diferencial foi a antropometria avançada e os ajustes finos a cada retorno. Resultado real, sem dieta milagrosa.",
  },
  {
    name: "Luciana Ferreira",
    role: "Pós-cirurgia bariátrica · Acompanhamento clínico",
    rating: 5,
    initials: "LF",
    text:
      "Saí do hospital perdida e encontrei na Ryani uma escuta humanizada e protocolo técnico de altíssimo nível. Reverti a deficiência de B12 e ferro e voltei a ter energia para a rotina.",
  },
  {
    name: "Eduardo Martins",
    role: "Executivo · Saúde metabólica",
    rating: 5,
    initials: "EM",
    text:
      "Glicemia e triglicerídeos normalizados em três meses, sem dietas restritivas e dentro da minha rotina de viagens. A Ryani entende que evidência científica e vida real precisam caber no mesmo plano.",
  },
  {
    name: "Beatriz Almeida",
    role: "Corredora de rua · Nutrição esportiva",
    rating: 5,
    initials: "BA",
    text:
      "Recuperação muscular muito mais rápida e zero episódio de queda de energia nas provas longas. A periodização nutricional fez total diferença no meu desempenho.",
  },
];

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < value
              ? "size-4 fill-accent text-accent"
              : "size-4 text-muted-foreground/30"
          }
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  const ref = useReveal<HTMLDivElement>();
  const [active, setActive] = useState(0);
  const total = testimonials.length;

  const go = (dir: 1 | -1) =>
    setActive((i) => (i + dir + total) % total);

  const current = testimonials[active];

  return (
    <section
      id="depoimentos"
      className="scroll-mt-24 bg-background py-20 sm:py-28"
    >
      <div
        ref={ref}
        className="reveal mx-auto max-w-6xl px-5 sm:px-8"
      >
        <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-accent">
              Depoimentos
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
              Resultados que falam por si.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Histórias reais de pacientes que confiaram no método: ciência,
              escuta humanizada e acompanhamento próximo.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-accent text-accent" />
              ))}
            </div>
            <span className="font-medium text-foreground">5,0</span>
            <span>· {total}+ avaliações</span>
          </div>
        </div>

        {/* Destaque rotativo */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <article className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-card sm:p-12">
            <Quote className="absolute right-8 top-8 size-16 text-accent/15" />
            <Stars value={current.rating} />
            <blockquote className="mt-6 font-display text-xl leading-relaxed text-foreground sm:text-2xl">
              "{current.text}"
            </blockquote>
            <div className="mt-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary font-display text-base font-semibold text-primary-foreground">
                  {current.initials}
                </div>
                <div>
                  <p className="font-display text-base text-foreground">
                    {current.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {current.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Depoimento anterior"
                  className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Próximo depoimento"
                  className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ir para depoimento ${i + 1}`}
                  className={
                    i === active
                      ? "h-1.5 w-8 rounded-full bg-accent transition-all"
                      : "h-1.5 w-3 rounded-full bg-border transition-all hover:bg-muted-foreground/40"
                  }
                />
              ))}
            </div>
          </article>

          {/* Mini lista lateral */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {testimonials
              .filter((_, i) => i !== active)
              .slice(0, 3)
              .map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() =>
                    setActive(testimonials.findIndex((x) => x.name === t.name))
                  }
                  className="group rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card"
                >
                  <Stars value={t.rating} />
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground">
                    "{t.text}"
                  </p>
                  <p className="mt-3 font-display text-sm text-foreground">
                    {t.name}
                  </p>
                </button>
              ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border bg-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-display text-lg text-foreground">
              Você é paciente? Compartilhe sua experiência.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Seu depoimento ajuda outras pessoas a darem o próximo passo na
              jornada.
            </p>
          </div>
          <WhatsAppButton
            message="Olá Ryani! Gostaria de enviar meu depoimento sobre o atendimento."
            variant="ghost-light"
          >
            Enviar meu depoimento
          </WhatsAppButton>
        </div>
      </div>
    </section>
  );
}