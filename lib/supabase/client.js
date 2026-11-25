import { createBrowserClient } from "@supabase/ssr";

// Used inside Client Components ("use client" files) - e.g. forms,
// buttons, anything that runs in the browser. Reuse one client instance
// instead of creating a new one on every render.
let browserClient;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return browserClient;
}
