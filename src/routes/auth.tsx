import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Eye, EyeOff, Leaf, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const LoginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

const SignupSchema = LoginSchema.extend({
  full_name: z.string().trim().min(2, "Informe seu nome"),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acessar painel — EasyHealth" },
      { name: "description", content: "Acesso restrito ao painel administrativo." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", remember: true });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const schema = mode === "login" ? LoginSchema : SignupSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Bem-vinda de volta!");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: { full_name: form.full_name },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode acessar.");
        navigate({ to: "/admin" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao autenticar";
      toast.error(msg.includes("Invalid login") ? "E-mail ou senha incorretos" : msg);
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/admin`,
      });
      if (result.error) {
        toast.error("Falha ao entrar com Google");
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/admin" });
    } catch {
      toast.error("Erro inesperado no login com Google");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 dark:from-emerald-950/40 dark:via-background dark:to-emerald-900/20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,oklch(0.92_0.05_160/0.6),transparent_55%),radial-gradient(circle_at_80%_90%,oklch(0.88_0.08_180/0.4),transparent_60%)] pointer-events-none" />
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-foreground text-background">
              <Leaf className="h-4 w-4" />
            </span>
            EasyHealth
          </Link>
        </div>
        <div className="relative z-10 max-w-md space-y-6">
          <h2 className="font-serif text-4xl leading-tight tracking-tight">
            Gestão clínica com a leveza que sua rotina merece.
          </h2>
          <p className="text-muted-foreground">
            Agenda, prontuários e planos alimentares em um único painel — para que você foque no que importa: o cuidado.
          </p>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex -space-x-2">
              {["E", "M", "L"].map((c) => (
                <div key={c} className="h-8 w-8 rounded-full bg-foreground text-background grid place-items-center text-xs font-medium ring-2 ring-background">
                  {c}
                </div>
              ))}
            </div>
            <span className="text-muted-foreground">Usado por nutricionistas em todo o Brasil</span>
          </div>
        </div>
        <p className="relative z-10 text-xs text-muted-foreground">© {new Date().getFullYear()} EasyHealth</p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 font-semibold">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-foreground text-background">
              <Leaf className="h-4 w-4" />
            </span>
            EasyHealth
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "login" ? "Entrar no painel" : "Criar sua conta"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Use seu e-mail e senha para acessar."
                : "Preencha seus dados para começar a usar."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <Field label="Nome completo" error={errors.full_name}>
                <Input
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  placeholder="Dra. Ryani Antonio"
                  autoComplete="name"
                />
              </Field>
            )}
            <Field label="E-mail" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="voce@clinica.com"
                autoComplete="email"
              />
            </Field>
            <Field label="Senha" error={errors.password}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded-md"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {mode === "login" && (
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Checkbox
                  checked={form.remember}
                  onCheckedChange={(v) => set("remember", Boolean(v))}
                />
                Manter-me conectada
              </label>
            )}

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Separator className="flex-1" />
            <span>ou</span>
            <Separator className="flex-1" />
          </div>

          <Button type="button" variant="outline" className="w-full h-10" onClick={onGoogle} disabled={loading}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            Continuar com Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErrors({}); }}
              className="text-foreground font-medium hover:underline underline-offset-4"
            >
              {mode === "login" ? "Criar conta" : "Entrar"}
            </button>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Voltar ao site</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}