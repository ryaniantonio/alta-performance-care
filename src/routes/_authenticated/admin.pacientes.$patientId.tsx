import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft, AlertTriangle, ShieldAlert, Search, Plus, Trash2, Wand2,
  Lock, Copy, FileDown, Save,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { getPatient, type Patient } from "@/lib/clinical/patients";
import {
  FOODS, searchFoods, nutrientsFor, type Food, type FoodUnit,
} from "@/lib/clinical/foodDb";

export const Route = createFileRoute("/_authenticated/admin/pacientes/$patientId")({
  loader: ({ params }) => {
    const patient = getPatient(params.patientId);
    if (!patient) throw notFound();
    return { patient };
  },
  component: ConsultationPage,
  notFoundComponent: () => (
    <div className="p-10">
      <p className="text-sm text-muted-foreground">Paciente não encontrado.</p>
      <Button asChild variant="link" className="px-0">
        <Link to="/admin/pacientes">Voltar para pacientes</Link>
      </Button>
    </div>
  ),
});

// ---------- shared types ----------
type MealKey =
  | "cafe_manha" | "lanche_manha" | "almoco" | "lanche_tarde" | "jantar" | "ceia";

const MEALS: { key: MealKey; label: string; time: string }[] = [
  { key: "cafe_manha",   label: "Café da manhã",   time: "07:00" },
  { key: "lanche_manha", label: "Lanche da manhã", time: "10:00" },
  { key: "almoco",       label: "Almoço",          time: "12:30" },
  { key: "lanche_tarde", label: "Lanche da tarde", time: "15:30" },
  { key: "jantar",       label: "Jantar",          time: "19:30" },
  { key: "ceia",         label: "Ceia",            time: "22:00" },
];

type FoodEntry = {
  uid: string;
  foodId: string;
  amount: number;
  unit: FoodUnit;
};

type MealMap = Record<MealKey, FoodEntry[]>;

const emptyMeals = (): MealMap => Object.fromEntries(
  MEALS.map((m) => [m.key, [] as FoodEntry[]]),
) as unknown as MealMap;

// ---------- main ----------
function ConsultationPage() {
  const { patient } = Route.useLoaderData();

  // shared mock state for this consultation (in-memory)
  const [recall, setRecall] = useState<MealMap>(seedRecall());
  const [recallLocked, setRecallLocked] = useState(false);
  const [plan, setPlan] = useState<MealMap>(emptyMeals());
  const [planDraftFromRecall, setPlanDraftFromRecall] = useState(false);
  const [activeTab, setActiveTab] = useState("anamnese");

  function generatePlanFromRecall() {
    setPlan(structuredClone(recall));
    setRecallLocked(true);
    setPlanDraftFromRecall(true);
    setActiveTab("plano");
    toast.success("Plano gerado a partir do recordatório", {
      description: "O recordatório foi bloqueado como linha de base histórica.",
    });
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
        <Link to="/admin/pacientes"><ArrowLeft className="h-4 w-4" /> Pacientes</Link>
      </Button>

      <PatientHeader patient={patient} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList className="h-auto p-1 flex-nowrap">
            <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
            <TabsTrigger value="avaliacao">Avaliação Corporal</TabsTrigger>
            <TabsTrigger value="gasto">Gasto Energético</TabsTrigger>
            <TabsTrigger value="recordatorio">Recordatório Alimentar</TabsTrigger>
            <TabsTrigger value="plano">Plano Alimentar</TabsTrigger>
            <TabsTrigger value="prescricao">Prescrição & Laudos</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="anamnese" className="mt-6"><AnamneseTab /></TabsContent>
        <TabsContent value="avaliacao" className="mt-6"><AvaliacaoTab /></TabsContent>
        <TabsContent value="gasto" className="mt-6"><GastoTab patient={patient} /></TabsContent>

        <TabsContent value="recordatorio" className="mt-6">
          <FoodDiary
            title="Recordatório Alimentar (24h)"
            description="Registro do que o paciente consumiu nas últimas 24 horas. Serve como linha de base."
            meals={recall}
            onChange={setRecall}
            locked={recallLocked}
            primaryAction={
              <Button onClick={generatePlanFromRecall} disabled={recallLocked && planDraftFromRecall}>
                <Wand2 className="h-4 w-4" />
                Gerar Plano a partir deste Recordatório
              </Button>
            }
            secondaryAction={
              recallLocked ? (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" /> Salvo como linha de base
                </Badge>
              ) : null
            }
          />
        </TabsContent>

        <TabsContent value="plano" className="mt-6">
          <FoodDiary
            title="Plano Alimentar (rascunho)"
            description={
              planDraftFromRecall
                ? "Rascunho copiado a partir do recordatório. Ajuste porções e substituições conforme a estratégia."
                : "Monte o plano alimentar para este paciente."
            }
            meals={plan}
            onChange={setPlan}
            primaryAction={
              <Button>
                <Save className="h-4 w-4" />
                Salvar plano
              </Button>
            }
            secondaryAction={
              planDraftFromRecall && (
                <Badge className="gap-1" variant="outline">
                  <Copy className="h-3 w-3" /> Origem: Recordatório
                </Badge>
              )
            }
          />
        </TabsContent>

        <TabsContent value="prescricao" className="mt-6"><PrescricaoTab patient={patient} /></TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- header ----------
function PatientHeader({ patient }: { patient: Patient }) {
  const initials = patient.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
  const comorb = patient.alerts.filter((a) => a.kind === "comorbidade");
  const allerg = patient.alerts.filter((a) => a.kind === "alergia");

  return (
    <div className="rounded-2xl border bg-background p-5 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-foreground text-background grid place-items-center font-semibold">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{patient.name}</h1>
            <p className="text-sm text-muted-foreground">
              {patient.age} anos · {patient.sex === "F" ? "Feminino" : "Masculino"} · Objetivo: <span className="text-foreground font-medium">{patient.goal}</span>
            </p>
          </div>
        </div>

        <Separator className="lg:hidden" />
        <div className="hidden lg:block h-12 w-px bg-border mx-2" />

        <div className="flex-1 grid sm:grid-cols-2 gap-3">
          <AlertBlock
            icon={<ShieldAlert className="h-4 w-4" />}
            label="Comorbidades"
            items={comorb.map((a) => a.label)}
            tone="warn"
          />
          <AlertBlock
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Alergias / intolerâncias"
            items={allerg.map((a) => a.label)}
            tone="danger"
          />
        </div>
      </div>
    </div>
  );
}

function AlertBlock({ icon, label, items, tone }: {
  icon: React.ReactNode; label: string; items: string[]; tone: "warn" | "danger";
}) {
  return (
    <div className={cn(
      "rounded-xl border p-3",
      tone === "warn" ? "bg-amber-50/60 border-amber-200" : "bg-rose-50/60 border-rose-200",
    )}>
      <div className={cn(
        "flex items-center gap-2 text-xs font-medium",
        tone === "warn" ? "text-amber-800" : "text-rose-800",
      )}>
        {icon}{label}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="text-xs text-muted-foreground">Nenhum registro</span>
        ) : items.map((it) => (
          <span key={it} className="px-2 py-0.5 text-xs rounded-full bg-background border">{it}</span>
        ))}
      </div>
    </div>
  );
}

// ---------- simple tabs ----------
function SectionCard({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-background p-5 lg:p-6">
      <h2 className="font-semibold">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function AnamneseTab() {
  return (
    <SectionCard title="Anamnese clínica" description="Histórico, hábitos de vida, queixas e objetivos.">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Queixa principal"><Textarea rows={3} placeholder="Ex: ganho de peso após gestação..." /></Field>
        <Field label="História pregressa"><Textarea rows={3} /></Field>
        <Field label="Medicações em uso"><Textarea rows={2} /></Field>
        <Field label="Hábito intestinal"><Input placeholder="Frequência, consistência..." /></Field>
        <Field label="Sono"><Input placeholder="Horas/qualidade" /></Field>
        <Field label="Atividade física"><Input placeholder="Modalidade, frequência" /></Field>
      </div>
    </SectionCard>
  );
}

function AvaliacaoTab() {
  return (
    <SectionCard title="Avaliação corporal" description="Antropometria, dobras e bioimpedância.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Field label="Peso (kg)"><Input type="number" defaultValue={68.4} /></Field>
        <Field label="Altura (cm)"><Input type="number" defaultValue={165} /></Field>
        <Field label="IMC"><Input value="25.1" readOnly /></Field>
        <Field label="% Gordura"><Input type="number" defaultValue={26} /></Field>
        <Field label="Massa magra (kg)"><Input type="number" defaultValue={50.6} /></Field>
        <Field label="Cintura (cm)"><Input type="number" defaultValue={78} /></Field>
        <Field label="Quadril (cm)"><Input type="number" defaultValue={98} /></Field>
        <Field label="RCQ"><Input value="0.80" readOnly /></Field>
      </div>
    </SectionCard>
  );
}

function GastoTab({ patient }: { patient: Patient }) {
  // simple Mifflin-St Jeor mock with placeholders
  const tmb = patient.sex === "F" ? 1380 : 1620;
  const get = Math.round(tmb * 1.55);
  return (
    <SectionCard title="Gasto energético" description="Estimativa de TMB e GET (Mifflin-St Jeor).">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="TMB" value={`${tmb} kcal`} />
        <Stat label="Fator atividade" value="1.55" />
        <Stat label="GET" value={`${get} kcal`} />
        <Stat label="Meta calórica" value={`${get - 300} kcal`} />
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Valores estimados. Ajuste de acordo com a estratégia (déficit/superávit) e revise em retorno.
      </p>
    </SectionCard>
  );
}

function PrescricaoTab({ patient }: { patient: Patient }) {
  return (
    <SectionCard title="Prescrição & laudos" description="Gere documentos clínicos e prescrições nutricionais.">
      <div className="grid sm:grid-cols-2 gap-3">
        <DocCard title="Plano alimentar" desc="PDF com branding e dados profissionais." />
        <DocCard title="Receituário nutricional" desc="Suplementação e orientações." />
        <DocCard title="Laudo de avaliação" desc="Antropometria e composição corporal." />
        <DocCard title="Orientações gerais" desc={`Personalizadas para ${patient.name.split(" ")[0]}.`} />
      </div>
    </SectionCard>
  );
}

function DocCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border p-4 flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg bg-muted grid place-items-center">
        <FileDown className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Button size="sm" variant="outline">Gerar PDF</Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

// ---------- FOOD DIARY (Recordatório + Plano) ----------
const TARGETS = { kcal: 2000, carbs: 250, protein: 120, fat: 65 };

function FoodDiary({
  title, description, meals, onChange, locked, primaryAction, secondaryAction,
}: {
  title: string;
  description?: string;
  meals: MealMap;
  onChange: (next: MealMap) => void;
  locked?: boolean;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}) {
  const totals = useMemo(() => computeTotals(meals), [meals]);

  function update(mealKey: MealKey, entries: FoodEntry[]) {
    onChange({ ...meals, [mealKey]: entries });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">{title}</h2>
            {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {secondaryAction}
            {primaryAction}
          </div>
        </div>

        {MEALS.map((m) => (
          <MealSection
            key={m.key}
            label={m.label}
            time={m.time}
            entries={meals[m.key]}
            onChange={(next) => update(m.key, next)}
            locked={locked}
          />
        ))}
      </div>

      <NutrientTracker totals={totals} />
    </div>
  );
}

function MealSection({
  label, time, entries, onChange, locked,
}: {
  label: string; time: string;
  entries: FoodEntry[];
  onChange: (next: FoodEntry[]) => void;
  locked?: boolean;
}) {
  function addEntry(food: Food) {
    const defaultUnit = (Object.keys(food.measures)[0] ?? "g") as FoodUnit;
    onChange([
      ...entries,
      { uid: crypto.randomUUID(), foodId: food.id, amount: defaultUnit === "g" ? 100 : 1, unit: defaultUnit },
    ]);
  }
  function patch(uid: string, p: Partial<FoodEntry>) {
    onChange(entries.map((e) => (e.uid === uid ? { ...e, ...p } : e)));
  }
  function remove(uid: string) {
    onChange(entries.filter((e) => e.uid !== uid));
  }

  const mealTotals = useMemo(() => {
    return entries.reduce((acc, e) => {
      const food = FOODS.find((f) => f.id === e.foodId);
      if (!food) return acc;
      const n = nutrientsFor(food, e.amount || 0, e.unit);
      acc.kcal += n.kcal;
      return acc;
    }, { kcal: 0 });
  }, [entries]);

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {Math.round(mealTotals.kcal)} kcal
        </span>
      </div>

      <div className="divide-y">
        {entries.map((e) => {
          const food = FOODS.find((f) => f.id === e.foodId);
          if (!food) return null;
          const n = nutrientsFor(food, e.amount || 0, e.unit);
          const units = Object.keys(food.measures) as FoodUnit[];
          return (
            <div key={e.uid} className="px-4 py-3 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-medium">{food.name}</p>
                <p className="text-xs text-muted-foreground">
                  {food.category} · {Math.round(n.grams)}g · {Math.round(n.kcal)} kcal
                </p>
              </div>
              <Input
                type="number"
                min={0}
                step="0.1"
                className="w-24"
                value={e.amount}
                disabled={locked}
                onChange={(ev) => patch(e.uid, { amount: Number(ev.target.value) })}
              />
              <Select
                value={e.unit}
                onValueChange={(v) => patch(e.uid, { unit: v as FoodUnit })}
                disabled={locked}
              >
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost" size="icon"
                onClick={() => remove(e.uid)}
                disabled={locked}
                aria-label="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

        {!locked && (
          <div className="px-4 py-3">
            <FoodAutocomplete onPick={addEntry} />
          </div>
        )}
        {entries.length === 0 && locked && (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">Sem itens nesta refeição.</p>
        )}
      </div>
    </div>
  );
}

function FoodAutocomplete({ onPick }: { onPick: (f: Food) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchFoods(q), [q]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar alimento (ex: arroz, frango, banana)..."
          className="pl-9"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 rounded-lg border bg-popover shadow-md overflow-hidden">
          {results.map((f) => (
            <button
              key={f.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onPick(f);
                setQ("");
                setOpen(false);
              }}
            >
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{f.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{f.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function computeTotals(meals: MealMap) {
  const totals = { kcal: 0, carbs: 0, protein: 0, fat: 0 };
  for (const list of Object.values(meals)) {
    for (const e of list) {
      const food = FOODS.find((f) => f.id === e.foodId);
      if (!food) continue;
      const n = nutrientsFor(food, e.amount || 0, e.unit);
      totals.kcal += n.kcal;
      totals.carbs += n.carbs;
      totals.protein += n.protein;
      totals.fat += n.fat;
    }
  }
  return totals;
}

function NutrientTracker({ totals }: { totals: { kcal: number; carbs: number; protein: number; fat: number } }) {
  const pct = (v: number, t: number) => Math.min(100, Math.round((v / t) * 100));
  return (
    <aside className="lg:sticky lg:top-4 h-fit rounded-xl border bg-background p-5 space-y-5">
      <div>
        <p className="text-xs text-muted-foreground">VET — Total energético</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-3xl font-semibold tabular-nums">{Math.round(totals.kcal)}</p>
          <p className="text-sm text-muted-foreground">/ {TARGETS.kcal} kcal</p>
        </div>
        <KcalRing value={totals.kcal} target={TARGETS.kcal} />
      </div>

      <Separator />

      <div className="space-y-3">
        <MacroBar label="Carboidratos" value={totals.carbs} target={TARGETS.carbs} pct={pct(totals.carbs, TARGETS.carbs)} color="bg-sky-500" />
        <MacroBar label="Proteínas"    value={totals.protein} target={TARGETS.protein} pct={pct(totals.protein, TARGETS.protein)} color="bg-emerald-500" />
        <MacroBar label="Gorduras"     value={totals.fat} target={TARGETS.fat} pct={pct(totals.fat, TARGETS.fat)} color="bg-amber-500" />
      </div>

      <p className="text-[11px] text-muted-foreground">
        Metas baseadas no GET estimado. Edite em "Gasto Energético".
      </p>
    </aside>
  );
}

function MacroBar({ label, value, target, pct, color }: {
  label: string; value: number; target: number; pct: number; color: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {Math.round(value)}g / {target}g
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function KcalRing({ value, target }: { value: number; target: number }) {
  const pct = Math.min(100, (value / target) * 100);
  return <Progress value={pct} className="mt-3 h-2" />;
}

// ---------- seed ----------
function seedRecall(): MealMap {
  return {
    cafe_manha: [
      { uid: crypto.randomUUID(), foodId: "pao-frances", amount: 1, unit: "unidade" },
      { uid: crypto.randomUUID(), foodId: "cafe-coado", amount: 1, unit: "xícara" },
      { uid: crypto.randomUUID(), foodId: "banana", amount: 1, unit: "unidade" },
    ],
    lanche_manha: [],
    almoco: [
      { uid: crypto.randomUUID(), foodId: "arroz-branco", amount: 4, unit: "colher de sopa" },
      { uid: crypto.randomUUID(), foodId: "feijao-carioca", amount: 2, unit: "colher de sopa" },
      { uid: crypto.randomUUID(), foodId: "frango-peito", amount: 1, unit: "unidade" },
      { uid: crypto.randomUUID(), foodId: "salada-folhas", amount: 1, unit: "xícara" },
    ],
    lanche_tarde: [
      { uid: crypto.randomUUID(), foodId: "iogurte-natural", amount: 1, unit: "unidade" },
    ],
    jantar: [
      { uid: crypto.randomUUID(), foodId: "batata-doce", amount: 1, unit: "unidade" },
      { uid: crypto.randomUUID(), foodId: "ovo", amount: 2, unit: "unidade" },
    ],
    ceia: [],
  };
}