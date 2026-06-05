import { createFileRoute } from "@tanstack/react-router";
import { FileText, Plus, Copy } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/modelos")({
  component: ModelosPage,
});

const MODELS = [
  { title: "Plano alimentar — Emagrecimento", desc: "Estrutura padrão de 5 refeições com substituições.", uses: 42 },
  { title: "Plano alimentar — Hipertrofia", desc: "Foco em ganho de massa magra e periodização.", uses: 31 },
  { title: "Orientação pediátrica", desc: "Modelo introdutório para crianças de 2–10 anos.", uses: 18 },
  { title: "Dietoterapia enteral", desc: "Cálculo padrão para terapia enteral domiciliar.", uses: 9 },
  { title: "Pré e pós-treino", desc: "Recomendações para atletas amadores e profissionais.", uses: 22 },
  { title: "Reeducação alimentar", desc: "Modelo gradual com metas semanais.", uses: 27 },
];

function ModelosPage() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Modelos"
        description="Templates de planos e orientações reutilizáveis."
        actions={<Button><Plus className="h-4 w-4" /> Novo modelo</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODELS.map((m) => (
          <article key={m.title} className="rounded-xl border bg-background p-5 hover:shadow-sm transition-shadow group">
            <div className="h-10 w-10 rounded-lg bg-muted grid place-items-center mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-medium">{m.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{m.uses} usos</span>
              <Button variant="ghost" size="sm"><Copy className="h-3.5 w-3.5" /> Duplicar</Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}