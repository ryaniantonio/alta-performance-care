import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type PatientRow = Database["public"]["Tables"]["patients"]["Row"];
export type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
export type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];

export type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];

export type RecordRow = Database["public"]["Tables"]["patient_records"]["Row"];
export type RecordKind =
  | "anamnese"
  | "avaliacao"
  | "gasto"
  | "recordatorio"
  | "plano"
  | "prescricao";

export type PatientAlert = { kind: "comorbidade" | "alergia"; label: string };

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Não autenticado");
  return data.user.id;
}

/* -------- patients -------- */
export async function listPatients(): Promise<PatientRow[]> {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPatient(id: string): Promise<PatientRow | null> {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createPatient(input: Omit<PatientInsert, "user_id">) {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("patients")
    .insert({ ...input, user_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePatient(id: string, patch: PatientUpdate) {
  const { data, error } = await supabase
    .from("patients")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePatient(id: string) {
  const { error } = await supabase.from("patients").delete().eq("id", id);
  if (error) throw error;
}

/* -------- appointments -------- */
export async function listAppointments(opts?: { from?: string; to?: string }) {
  let q = supabase
    .from("appointments")
    .select("*, patient:patients(id,name,tag)")
    .order("scheduled_at", { ascending: true });
  if (opts?.from) q = q.gte("scheduled_at", opts.from);
  if (opts?.to) q = q.lt("scheduled_at", opts.to);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getAppointment(id: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patient:patients(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createAppointment(input: Omit<AppointmentInsert, "user_id">) {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("appointments")
    .insert({ ...input, user_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAppointment(
  id: string,
  patch: Database["public"]["Tables"]["appointments"]["Update"],
) {
  const { data, error } = await supabase
    .from("appointments")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) throw error;
}

/* -------- records (anamnese, avaliacao, gasto, recordatorio, plano, prescricao) -------- */
export async function listRecords(patient_id: string): Promise<RecordRow[]> {
  const { data, error } = await supabase
    .from("patient_records")
    .select("*")
    .eq("patient_id", patient_id);
  if (error) throw error;
  return data ?? [];
}

export async function upsertRecord(args: {
  patient_id: string;
  kind: RecordKind;
  data: unknown;
  locked?: boolean;
}) {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("patient_records")
    .upsert(
      {
        user_id,
        patient_id: args.patient_id,
        kind: args.kind,
        data: args.data as never,
        locked: args.locked ?? false,
      },
      { onConflict: "patient_id,kind" },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}