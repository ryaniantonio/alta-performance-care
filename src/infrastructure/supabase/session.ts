import { supabase } from "@/integrations/supabase/client";

/** Returns the currently-authenticated user id, or throws. */
export async function getCurrentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Não autenticado");
  return data.user.id;
}