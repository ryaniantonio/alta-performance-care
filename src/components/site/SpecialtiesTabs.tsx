import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Ruler,
  Dumbbell,
  HeartPulse,
  Baby,
  Apple,
  Hospital,
  type LucideIcon,
} from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

type Card = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const adulto: Card[] = [
  {
    icon: Ruler,
    title: "Avaliação Antropométrica Avançada",
    description:
      "Composição corporal detalhada — massa magra, gordura, massa muscular, dobras cutâneas e bioimpedância. Muito além da balança.",
  },
  {
    icon: Dumbbell,
    title: "Performance Esportiva",
    description:
      "Hipertrofia, emagrecimento, rendimento nos treinos e otimização criteriosa de suplementação.",
  },
  {
    icon: HeartPulse,
    title: "Nutrição Clínica Geral",
    description:
      "Prevenção e tratamento de doenças metabólicas, saúde intestinal, terapia nutricional enteral e análise rigorosa de exames laboratoriais.",
  },
];

const pediatria: Card[] = [
  {
    icon: Baby,
    title: "Introdução Alimentar Segura",
    description:
      "Prevenção de engasgos e alergias, com a segurança técnica de quem tem bagagem de urgência hospitalar.",
  },
  {
    icon: Apple,
    title: "Nutrição Infantil Preventiva",
    description:
      "Manejo de seletividade alimentar, dificuldades de crescimento e alergias (APLV) com plano individualizado.",
  },
  {
    icon: Hospital,
    title: "Suporte Pós-Alta Hospitalar",
    description:
      "Continuidade do cuidado clínico para crianças que passaram por internação ou condições complexas.",
  },
];

function CardItem({ card, accent }: { card: Card; accent: "accent" | "primary" }) {
  const Icon = card.icon;
  return (
    <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-premium">
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-xl",
          accent === "accent" ? "bg-accent/12 text-accent" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="size-6" />
      </span>
      <h3 className="mt-5 font-display text-xl text-foreground">{card.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
    </div>
  );
}

export function SpecialtiesTabs() {
  const [value, setValue] = useState<"adulto" | "pediatria">("adulto");
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="especialidades" className="scroll-mt-24 py-20 sm:py-28">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-accent">Hub de Especialidades</p>
          <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Dois universos, uma só ciência.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Escolha o eixo de cuidado e veja como a abordagem é construída — sempre baseada em evidências e personalizado.
          </p>
        </div>

        <Tabs
          value={value}
          onValueChange={(v) => setValue(v as "adulto" | "pediatria")}
          className="mt-10"
        >
          <TabsList className="mx-auto grid h-auto w-full max-w-md grid-cols-2 rounded-full border border-border bg-background p-1 shadow-card">
            <TabsTrigger
              value="adulto"
              className="rounded-full py-2.5 text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
            >
              Adulto · Clínica & Esporte
            </TabsTrigger>
            <TabsTrigger
              value="pediatria"
              className="rounded-full py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              Pediatria
            </TabsTrigger>
          </TabsList>

          <TabsContent value="adulto" className="mt-10 animate-fade-in">
            <div className="grid gap-5 md:grid-cols-3">
              {adulto.map((c) => (
                <CardItem key={c.title} card={c} accent="accent" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pediatria" className="mt-10 animate-fade-in">
            <div className="grid gap-5 md:grid-cols-3">
              {pediatria.map((c) => (
                <CardItem key={c.title} card={c} accent="primary" />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}