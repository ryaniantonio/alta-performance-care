import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PATIENTS } from "@/lib/clinical/patients";

export const Route = createFileRoute("/_authenticated/admin/pacientes/")({
  component: PacientesPage,
});

function PacientesPage() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Pacientes"
        description="Gerencie seus pacientes e histórico de atendimentos."
        actions={<Button><Plus className="h-4 w-4" /> Novo paciente</Button>}
      />

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, e-mail..." className="pl-9" />
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
            {PATIENTS.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted grid place-items-center text-xs font-medium">
                      {p.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
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
                <td className="px-5 py-3 hidden lg:table-cell text-muted-foreground">{p.lastVisit}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted">{p.tag}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/admin/pacientes/$patientId" params={{ patientId: p.id }}>Abrir</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}