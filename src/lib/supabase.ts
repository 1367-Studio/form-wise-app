import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let instance: SupabaseClient | undefined;

function getInstance(): SupabaseClient {
  if (!instance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
      );
    }
    instance = createClient(url, key);
  }
  return instance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getInstance(), prop);
  },
});
