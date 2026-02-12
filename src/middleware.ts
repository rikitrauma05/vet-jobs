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
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  // 🔥 QUESTA È LA CHIAVE
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;

  const pathname = request.nextUrl.pathname;

  if (!user && (pathname.startsWith("/admin") || pathname.startsWith("/vet"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && (pathname.startsWith("/admin") || pathname.startsWith("/vet"))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, approved")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.approved) {
      return NextResponse.redirect(new URL("/pending", request.url));
    }

    if (pathname.startsWith("/admin") && profile.role !== "admin") {
      return NextResponse.redirect(new URL("/vet", request.url));
    }

    if (pathname.startsWith("/vet") && profile.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/vet/:path*"],
};
