import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const supabase = await createSupabaseServerClient();
    const formData = await request.formData();

    const lavoro_id = formData.get("lavoro_id") as string | null;
    const prezzoRaw = formData.get("prezzo") as string | null;

    if (!lavoro_id) {
      return NextResponse.redirect(new URL("/admin/lavori", request.url));
    }

    const prezzo =
      prezzoRaw && prezzoRaw.trim() !== ""
        ? Number(prezzoRaw)
        : null;

    const { error } = await supabase
      .from("lavori")
      .update({ prezzo })
      .eq("id", lavoro_id);

    if (error) {
      console.error("Errore aggiornamento prezzo:", error.message);
    }

    return NextResponse.redirect(new URL("/admin/lavori", request.url));
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
