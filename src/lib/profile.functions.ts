import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Profile = {
  id: string;
  full_name: string | null;
  crn: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  clinic_phone: string | null;
  clinic_email: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};

const ProfileUpdateSchema = z.object({
  full_name: z.string().trim().max(120).nullable().optional(),
  crn: z.string().trim().max(40).nullable().optional(),
  clinic_name: z.string().trim().max(160).nullable().optional(),
  clinic_address: z.string().trim().max(280).nullable().optional(),
  clinic_phone: z.string().trim().max(40).nullable().optional(),
  clinic_email: z.string().trim().email().max(160).nullable().or(z.literal("")).optional(),
  logo_url: z.string().trim().max(500).nullable().optional(),
});

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (context.supabase as any)
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data as Profile | null };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProfileUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const payload = { ...data, clinic_email: data.clinic_email === "" ? null : data.clinic_email };
    const { data: row, error } = await (context.supabase as any)
      .from("profiles")
      .update(payload)
      .eq("id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { profile: row as Profile };
  });