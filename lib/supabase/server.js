import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Used inside Server Components, Server Actions and Route Handlers
// (app/api/**/route.js). Reads the user's session from cookies so that
// every query automatically carries their identity - this is what lets
// PostgreSQL's Row-Level Security policies see auth.uid() correctly.
// Next.js 16 requires async access to request-time APIs such as cookies().
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions (see proxy.js).
          }
        },
      },
    }
  );
}
