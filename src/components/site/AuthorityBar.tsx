import { Stethoscope, HeartPulse, Dumbbell, Ruler } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";

const items = [
  { icon: HeartPulse, label: "Residência em Urgência e Emergência Hospitalar Pediátrica - Hospital Infantil João Paulo II em Belo Horizonte - MG" },
  { icon: Stethoscope, label: "Pós-Graduação em Nutrição Clínica" },
  { icon: Dumbbell, label: "Pós-Graduação em Nutrição Esportiva" },
  { icon: Ruler, label: "Especialista em Avaliação Antropométrica Avançada" },
];

export function AuthorityBar() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="border-y border-border bg-secondary/40">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Formação & autoridade
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="group flex items-start gap-3 rounded-xl p-2 transition-colors"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background text-primary ring-1 ring-border transition-colors group-hover:text-accent">
                <Icon className="size-5" />
              </span>
              <p className="text-sm font-medium leading-snug text-foreground/85">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}