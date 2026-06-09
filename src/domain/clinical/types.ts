import type { Database } from "@/integrations/supabase/types";

/**
 * Domain types (DTOs) for the clinical module.
 * These are intentionally decoupled from the data-access layer so that callers
 * (services, hooks, components) never import Supabase generated types directly.
 */

export type PatientRow = Database["public"]["Tables"]["patients"]["Row"];
export type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
export type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];

export type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
export type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];

export type RecordRow = Database["public"]["Tables"]["patient_records"]["Row"];

export type RecordKind =
  | "anamnese"
  | "avaliacao"
  | "gasto"
  | "recordatorio"
  | "plano"
  | "prescricao";

export type PatientAlert = { kind: "comorbidade" | "alergia"; label: string };

/** Input DTOs used by services (what the UI sends in). */
export type CreatePatientDTO = Omit<PatientInsert, "user_id">;
export type UpdatePatientDTO = PatientUpdate;

export type CreateAppointmentDTO = Omit<AppointmentInsert, "user_id">;
export type UpdateAppointmentDTO = AppointmentUpdate;

export type UpsertRecordDTO = {
  patient_id: string;
  kind: RecordKind;
  data: unknown;
  locked?: boolean;
};

export type ListAppointmentsRange = { from?: string; to?: string };