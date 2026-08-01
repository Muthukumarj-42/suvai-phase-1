import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for client-side components running in the browser.
 * Safe to import in "use client" components as it does not rely on "next/headers".
 */
export function createBrowserClientInstance() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
