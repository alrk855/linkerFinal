import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

/**
 * For Server Components, Route Handlers returning JSON, and Server Actions.
 * Uses cookies() from next/headers — works when the response is NOT a redirect.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          } catch {
            // Called from Server Component — safe to ignore, middleware handles refresh.
          }
        },
      },
    }
  );
}

/**
 * Service role client — no cookies, full admin access.
 */
export function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * For Route Handlers that return NextResponse.redirect().
 * cookies() from next/headers does NOT forward onto redirect responses.
 * This version captures cookies in a Map and applies them to the response you return.
 *
 * Usage:
 *   const { supabase, finish } = createRedirectClient(request);
 *   // ... do auth work ...
 *   return finish(NextResponse.redirect(url));
 */
export function createRedirectClient(request: NextRequest) {
  const cookieMap = new Map<string, { value: string; options: Record<string, unknown> }>();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Use a Map so later calls overwrite earlier ones (not append)
          for (const { name, value, options } of cookiesToSet) {
            cookieMap.set(name, { value, options });
          }
        },
      },
    }
  );

  function finish(response: NextResponse): NextResponse {
    cookieMap.forEach(({ value, options }, name) => {
      response.cookies.set(name, value, options);
    });
    return response;
  }

  return { supabase, finish };
}
