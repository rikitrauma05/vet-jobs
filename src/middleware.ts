import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string) {
          response.cookies.delete(name);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Non loggato → blocco aree protette
  if (!user && (pathname.startsWith("/admin") || pathname.startsWith("/vet"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && (pathname.startsWith("/admin") || pathname.startsWith("/vet"))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, approved")
      .eq("id", user.id)
      .single();

    // profilo mancante o non approvato
    if (!profile || !profile.approved) {
      return NextResponse.redirect(new URL("/pending", request.url));
    }

    // vet che prova ad entrare in /admin
    if (pathname.startsWith("/admin") && profile.role !== "admin") {
      return NextResponse.redirect(new URL("/vet", request.url));
    }

    // admin che prova ad entrare in /vet (consentito o reindirizzato)
    if (pathname.startsWith("/vet") && profile.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/vet/:path*"],
};
