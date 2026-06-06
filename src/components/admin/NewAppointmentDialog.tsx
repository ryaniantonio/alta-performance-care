import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createAppointment, listPatients } from "@/lib/clinical/api";

export function NewAppointmentDialog({
  open, onOpenChange, defaultPatientId,
}: { open: boolean; onOpenChange: (v: boolean) => void; defaultPatientId?: string }) {
  const qc = useQueryClient();
  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: listPatients, enabled: open });

  const now = new Date();
  now.setMinutes(0, 0, 0); now.setHours(now.getHours() + 1);
  const defaultDt = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [patientId, setPatientId] = useState(defaultPatientId ?? "");
  const [scheduledAt, setScheduledAt] = useState(defaultDt);
  const [type, setType] = useState("Consulta");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createAppointment({
        patient_id: patientId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        type,
        notes: notes || null,
      }),
    onSuccess: () => {
      toast.success("Consulta agendada");
      qc.invalidateQueries({ queryKey: ["appointments"] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error("Erro ao agendar", { description: e.message }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova consulta</DialogTitle>
          <DialogDescription>Agende um atendimento para um paciente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Paciente</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
                {patients.length === 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">Cadastre um paciente primeiro.</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data e hora</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Input value={type} onChange={(e) => setType(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!patientId || !scheduledAt || mutation.isPending}
          >
            {mutation.isPending ? "Agendando..." : "Agendar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}