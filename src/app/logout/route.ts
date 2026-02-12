import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function logout(request: Request) {
  const response = NextResponse.redirect(
    new URL("/login", request.url),
    { status: 303 }
  );

  const supabase = await createSupabaseServerClient(response);

  await supabase.auth.signOut();

  return response;
}

export async function POST(request: Request) {
  return logout(request);
}

export async function GET(request: Request) {
  return logout(request);
}
