import { supabase } from "@/integrations/supabase/client";
import type {
  AppointmentInsert,
  AppointmentUpdate,
  ListAppointmentsRange,
} from "@/domain/clinical/types";

export const appointmentsRepository = {
  async list(range?: ListAppointmentsRange) {
    let q = supabase
      .from("appointments")
      .select("*, patient:patients(id,name,tag)")
      .order("scheduled_at", { ascending: true });
    if (range?.from) q = q.gte("scheduled_at", range.from);
    if (range?.to) q = q.lt("scheduled_at", range.to);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  },

  async findById(id: string) {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, patient:patients(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async insert(row: AppointmentInsert) {
    const { data, error } = await supabase
      .from("appointments")
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, patch: AppointmentUpdate) {
    const { data, error } = await supabase
      .from("appointments")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) throw error;
  },
};