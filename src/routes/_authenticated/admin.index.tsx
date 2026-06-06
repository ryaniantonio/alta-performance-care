import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Users, TrendingUp, Clock, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { listAppointments, listPatients } from "@/lib/clinical/api";
import { NewAppointmentDialog } from "@/components/admin/NewAppointmentDialog";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const [open, setOpen] = useState(false);
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay); endOfDay.setDate(endOfDay.getDate() + 1);

  const { data: appts = [], isLoading } = useQuery({
    queryKey: ["appointments", "today"],
    queryFn: () => listAppointments({ from: startOfDay.toISOString(), to: endOfDay.toISOString() }),
  });
  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: listPatients });

  const next = appts.find((a) => new Date(a.scheduled_at) >= new Date());
  const stats = [
    { label: "Consultas hoje", value: String(appts.length), icon: CalendarDays, hint: isLoading ? "carregando..." : "Hoje" },
    { label: "Pacientes ativos", value: String(patients.length), icon: Users, hint: "Cadastrados" },
    { label: "Taxa de retorno", value: "—", icon: TrendingUp, hint: "Em breve" },
    {
      label: "Próxima consulta",
      value: next ? new Date(next.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
      icon: Clock,
      hint: next ? (next as any).patient?.name ?? "" : "Sem agendamentos",
    },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Bom dia, profissional"
        description="Sua agenda e indicadores do dia."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nova consulta</Button>}
      />
      <NewAppointmentDialog open={open} onOpenChange={setOpen} />

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
            <p className="text-xs text-muted-foreground">{appts.length} atendimentos programados</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Nova consulta</Button>
        </div>
        <ul className="divide-y">
          {appts.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-muted-foreground">
              Nenhuma consulta hoje. Clique em "Nova consulta" para agendar.
            </li>
          )}
          {appts.map((a: any) => {
            const time = new Date(a.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return (
              <li key={a.id} className="px-5 py-4 flex items-center gap-4 hover:bg-muted/40 transition-colors">
                <div className="text-sm font-mono w-14 text-muted-foreground">{time}</div>
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{a.patient?.name ?? "Paciente"}</p>
                  <p className="text-xs text-muted-foreground">{a.type}</p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/agenda/$appointmentId" params={{ appointmentId: a.id }}>Abrir</Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}