import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save, Trash2, FileText } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  deleteAppointment, getAppointment, updateAppointment,
} from "@/lib/clinical/api";

export const Route = createFileRoute("/_authenticated/admin/agenda/$appointmentId")({
  component: AppointmentPage,
});

function AppointmentPage() {
  const { appointmentId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: appt, isLoading } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => getAppointment(appointmentId),
  });

  const [type, setType] = useState("");
  const [status, setStatus] = useState<string>("agendada");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!appt) return;
    setType(appt.type);
    setStatus(appt.status);
    const d = new Date(appt.scheduled_at);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setScheduledAt(local);
    setNotes(appt.notes ?? "");
  }, [appt]);

  const save = useMutation({
    mutationFn: () =>
      updateAppointment(appointmentId, {
        type, status, notes: notes || null,
        scheduled_at: new Date(scheduledAt).toISOString(),
      }),
    onSuccess: () => {
      toast.success("Consulta atualizada");
      qc.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (e: any) => toast.error("Erro", { description: e.message }),
  });

  const del = useMutation({
    mutationFn: () => deleteAppointment(appointmentId),
    onSuccess: () => {
      toast.success("Consulta removida");
      qc.invalidateQueries({ queryKey: ["appointments"] });
      navigate({ to: "/admin" });
    },
    onError: (e: any) => toast.error("Erro", { description: e.message }),
  });

  if (isLoading) return <div className="p-10 text-sm text-muted-foreground">Carregando...</div>;
  if (!appt) return (
    <div className="p-10">
      <p className="text-sm text-muted-foreground">Consulta não encontrada.</p>
      <Button asChild variant="link" className="px-0"><Link to="/admin">Voltar</Link></Button>
    </div>
  );

  const patient = (appt as any).patient;

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
        <Link to="/admin"><ArrowLeft className="h-4 w-4" /> Agenda</Link>
      </Button>

      <div className="rounded-2xl border bg-background p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Detalhes da consulta</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Paciente:{" "}
              {patient ? (
                <Link to="/admin/pacientes/$patientId" params={{ patientId: patient.id }} className="font-medium text-foreground underline-offset-4 hover:underline">
                  {patient.name}
                </Link>
              ) : "—"}
            </p>
          </div>
          <Badge variant="outline">{status}</Badge>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Data e hora</Label>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Input value={type} onChange={(e) => setType(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="realizada">Realizada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Observações</Label>
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 justify-between">
          <Button
            variant="outline"
            disabled={!patient}
            onClick={() => patient && navigate({ to: "/admin/pacientes/$patientId", params: { patientId: patient.id } })}
          >
            <FileText className="h-4 w-4" /> Abrir prontuário
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { if (confirm("Remover esta consulta?")) del.mutate(); }}>
              <Trash2 className="h-4 w-4" /> Remover
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              <Save className="h-4 w-4" /> {save.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}