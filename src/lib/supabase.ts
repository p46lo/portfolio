import { createBrowserClient } from "@supabase/ssr";

// Using any for simplicity - in production, generate proper types with:
// supabase gen types typescript --local > src/types/supabase.ts
export function createClient() {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server-side client (for API routes)
export function createServerClient() {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
