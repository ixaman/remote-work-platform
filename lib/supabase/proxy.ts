import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase public configuration");
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        const previousCookies = response.cookies.getAll();
        response = NextResponse.next({ request });
        previousCookies.forEach((cookie) => response.cookies.set(cookie));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: isAdmin, error } = await supabase.rpc("is_admin");
    if (error || isAdmin !== true) {
      // Clear cookies here because a Server Component cannot persist sign-out cookies.
      await supabase.auth.signOut({ scope: "local" });
      const destination = request.nextUrl.clone();
      destination.pathname = "/login";
      destination.search = "?error=forbidden";
      const denied = NextResponse.redirect(destination);
      response.cookies.getAll().forEach((cookie) => denied.cookies.set(cookie));
      response = denied;
    }
  }
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
