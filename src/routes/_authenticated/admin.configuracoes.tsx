import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  component: ConfiguracoesPage,
});

type FormState = {
  full_name: string;
  crn: string;
  clinic_name: string;
  clinic_address: string;
  clinic_phone: string;
  clinic_email: string;
  logo_url: string;
};

const EMPTY: FormState = {
  full_name: "", crn: "", clinic_name: "", clinic_address: "",
  clinic_phone: "", clinic_email: "", logo_url: "",
};

function ConfiguracoesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["my-profile"], queryFn: () => getMyProfile() });
  const [form, setForm] = useState<FormState>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!data?.profile) return;
    const p = data.profile;
    setForm({
      full_name: p.full_name ?? "",
      crn: p.crn ?? "",
      clinic_name: p.clinic_name ?? "",
      clinic_address: p.clinic_address ?? "",
      clinic_phone: p.clinic_phone ?? "",
      clinic_email: p.clinic_email ?? "",
      logo_url: p.logo_url ?? "",
    });
  }, [data]);

  const save = useMutation({
    mutationFn: (payload: Partial<FormState>) => updateMyProfile({ data: payload }),
    onSuccess: () => {
      toast.success("Perfil atualizado");
      qc.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao salvar"),
  });

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onUploadLogo(file: File) {
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Sessão expirada");
      const ext = file.name.split(".").pop() || "png";
      const path = `${uid}/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("logos").getPublicUrl(path);
      const url = pub.publicUrl;
      set("logo_url", url);
      await save.mutateAsync({ logo_url: url });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    save.mutate(form);
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <PageHeader
        title="Configurações do perfil"
        description="Estes dados aparecem em PDFs e documentos gerados pelo sistema."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Logo */}
          <section className="rounded-xl border bg-background p-6">
            <h2 className="font-medium">Logo profissional</h2>
            <p className="text-sm text-muted-foreground mt-1">PNG ou JPG, fundo transparente recomendado.</p>
            <div className="mt-5 flex items-center gap-5">
              <div className="h-20 w-20 rounded-lg border bg-muted/40 overflow-hidden grid place-items-center">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs text-muted-foreground">Sem logo</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUploadLogo(f);
                  }}
                />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Enviar logo
                </Button>
                {form.logo_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { set("logo_url", ""); save.mutate({ logo_url: "" }); }}
                  >
                    <Trash2 className="h-4 w-4" /> Remover
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* Dados pessoais */}
          <section className="rounded-xl border bg-background p-6 space-y-4">
            <h2 className="font-medium">Dados profissionais</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Row label="Nome completo">
                <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
              </Row>
              <Row label="CRN">
                <Input value={form.crn} onChange={(e) => set("crn", e.target.value)} placeholder="CRN-9 29813" />
              </Row>
            </div>
          </section>

          {/* Clínica */}
          <section className="rounded-xl border bg-background p-6 space-y-4">
            <h2 className="font-medium">Dados da clínica</h2>
            <Row label="Nome da clínica">
              <Input value={form.clinic_name} onChange={(e) => set("clinic_name", e.target.value)} />
            </Row>
            <Row label="Endereço">
              <Input value={form.clinic_address} onChange={(e) => set("clinic_address", e.target.value)} />
            </Row>
            <div className="grid sm:grid-cols-2 gap-4">
              <Row label="Telefone">
                <Input value={form.clinic_phone} onChange={(e) => set("clinic_phone", e.target.value)} placeholder="(27) 99999-9999" />
              </Row>
              <Row label="E-mail">
                <Input type="email" value={form.clinic_email} onChange={(e) => set("clinic_email", e.target.value)} placeholder="contato@clinica.com" />
              </Row>
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar alterações
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}