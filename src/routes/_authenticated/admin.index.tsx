import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Users, TrendingUp, Clock } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

const stats = [
  { label: "Consultas hoje", value: "6", icon: CalendarDays, hint: "+2 vs. ontem" },
  { label: "Pacientes ativos", value: "84", icon: Users, hint: "+4 este mês" },
  { label: "Taxa de retorno", value: "92%", icon: TrendingUp, hint: "Últimos 30 dias" },
  { label: "Próxima consulta", value: "09:30", icon: Clock, hint: "Mariana Costa" },
];

const today = [
  { time: "08:30", patient: "Eduardo Martins", type: "Personal Diet", color: "bg-emerald-500" },
  { time: "09:30", patient: "Mariana Costa", type: "Consulta clínica", color: "bg-sky-500" },
  { time: "11:00", patient: "Beatriz Almeida", type: "Retorno", color: "bg-amber-500" },
  { time: "14:00", patient: "Rafael Andrade", type: "Avaliação enteral", color: "bg-rose-500" },
  { time: "16:30", patient: "Luciana Ferreira", type: "Orientação", color: "bg-violet-500" },
];

function DashboardPage() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Bom dia, profissional"
        description="Sua agenda e indicadores do dia."
        actions={<Button>Nova consulta</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border bg-background p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border bg-background overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Agenda de hoje</h2>
            <p className="text-xs text-muted-foreground">5 atendimentos programados</p>
          </div>
          <Button variant="outline" size="sm">Ver agenda completa</Button>
        </div>
        <ul className="divide-y">
          {today.map((a) => (
            <li key={a.time} className="px-5 py-4 flex items-center gap-4 hover:bg-muted/40 transition-colors">
              <div className="text-sm font-mono w-14 text-muted-foreground">{a.time}</div>
              <div className={`h-2 w-2 rounded-full ${a.color}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{a.patient}</p>
                <p className="text-xs text-muted-foreground">{a.type}</p>
              </div>
              <Button variant="ghost" size="sm">Abrir</Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}