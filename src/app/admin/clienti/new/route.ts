import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const nome = formData.get("nome") as string;

    if (!nome) {
      return NextResponse.redirect(new URL("/admin/clienti", req.url));
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
      .from("clienti")
      .insert({ nome });

    if (error) {
      return NextResponse.redirect(new URL("/admin/clienti", req.url));
    }

    return NextResponse.redirect(new URL("/admin/clienti", req.url));
  } catch {
    return NextResponse.redirect(new URL("/admin/clienti", req.url));
  }
}
