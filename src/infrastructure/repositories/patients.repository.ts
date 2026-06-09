import { supabase } from "@/integrations/supabase/client";
import type {
  PatientInsert,
  PatientRow,
  PatientUpdate,
} from "@/domain/clinical/types";

/**
 * Patients repository.
 * Pure data-access: no auth resolution, no business rules.
 */
export const patientsRepository = {
  async list(): Promise<PatientRow[]> {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async findById(id: string): Promise<PatientRow | null> {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async insert(row: PatientInsert): Promise<PatientRow> {
    const { data, error } = await supabase
      .from("patients")
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, patch: PatientUpdate): Promise<PatientRow> {
    const { data, error } = await supabase
      .from("patients")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) throw error;
  },
};