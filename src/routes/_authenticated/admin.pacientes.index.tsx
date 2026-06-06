import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createPatient, deletePatient, listPatients, type PatientRow } from "@/lib/clinical/api";

export const Route = createFileRoute("/_authenticated/admin/pacientes/")({
  component: PacientesPage,
});

function PacientesPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data: patients = [], isLoading } = useQuery({ queryKey: ["patients"], queryFn: listPatients });

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      (p.email ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  const del = useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      toast.success("Paciente removido");
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (e: any) => toast.error("Erro", { description: e.message }),
  });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Pacientes"
        description="Gerencie seus pacientes e histórico de atendimentos."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Novo paciente</Button>}
      />
      <NewPatientDialog open={open} onOpenChange={setOpen} />

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, e-mail..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="rounded-xl border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Paciente</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Contato</th>
              <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Última consulta</th>
              <th className="text-left px-5 py-3 font-medium">Especialidade</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">Carregando...</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                Nenhum paciente. Clique em "Novo paciente" para cadastrar.
              </td></tr>
            )}
            {filtered.map((p) => (
              <PatientRowItem key={p.id} p={p} onDelete={() => del.mutate(p.id)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PatientRowItem({ p, onDelete }: { p: PatientRow; onDelete: () => void }) {
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted grid place-items-center text-xs font-medium">
            {p.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{p.name}</p>
            <p className="text-xs text-muted-foreground md:hidden">{p.phone}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3 hidden md:table-cell">
        <p>{p.email}</p>
        <p className="text-xs text-muted-foreground">{p.phone}</p>
      </td>
      <td className="px-5 py-3 hidden lg:table-cell text-muted-foreground">
        {p.last_visit ? new Date(p.last_visit).toLocaleDateString() : "—"}
      </td>
      <td className="px-5 py-3">
        {p.tag && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted">{p.tag}</span>}
      </td>
      <td className="px-5 py-3 text-right">
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/pacientes/$patientId" params={{ patientId: p.id }}>Abrir</Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Remover ${p.name}?`)) onDelete(); }}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function NewPatientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [sex, setSex] = useState<"F" | "M" | "O">("F");
  const [goal, setGoal] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tag, setTag] = useState("");

  const reset = () => { setName(""); setAge(""); setSex("F"); setGoal(""); setEmail(""); setPhone(""); setTag(""); };

  const m = useMutation({
    mutationFn: () => createPatient({
      name: name.trim(),
      age: age ? Number(age) : null,
      sex,
      goal: goal || null,
      email: email || null,
      phone: phone || null,
      tag: tag || null,
      alerts: [],
    }),
    onSuccess: () => {
      toast.success("Paciente cadastrado");
      qc.invalidateQueries({ queryKey: ["patients"] });
      reset();
      onOpenChange(false);
    },
    onError: (e: any) => toast.error("Erro", { description: e.message }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo paciente</DialogTitle>
          <DialogDescription>Cadastre os dados básicos. Você completa o prontuário em seguida.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Nome completo *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Idade</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sexo</Label>
              <Select value={sex} onValueChange={(v) => setSex(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="F">Feminino</SelectItem>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="O">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Especialidade</Label>
              <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Clínica, Esportiva..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Objetivo</Label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Emagrecimento, hipertrofia..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => m.mutate()} disabled={!name.trim() || m.isPending}>
            {m.isPending ? "Salvando..." : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}