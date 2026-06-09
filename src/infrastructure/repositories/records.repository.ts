import { supabase } from "@/integrations/supabase/client";
import type { RecordKind, RecordRow } from "@/domain/clinical/types";

export const recordsRepository = {
  async listByPatient(patient_id: string): Promise<RecordRow[]> {
    const { data, error } = await supabase
      .from("patient_records")
      .select("*")
      .eq("patient_id", patient_id);
    if (error) throw error;
    return data ?? [];
  },

  async upsert(row: {
    user_id: string;
    patient_id: string;
    kind: RecordKind;
    data: unknown;
    locked: boolean;
  }): Promise<RecordRow> {
    const { data, error } = await supabase
      .from("patient_records")
      .upsert(
        {
          user_id: row.user_id,
          patient_id: row.patient_id,
          kind: row.kind,
          data: row.data as never,
          locked: row.locked,
        },
        { onConflict: "patient_id,kind" },
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};