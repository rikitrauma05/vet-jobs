import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const updates = await req.json();
    const supabase = await createSupabaseServerClient();

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Formato dati non valido" },
        { status: 400 }
      );
    }

    for (const u of updates) {
      if (!u.id) continue;

      await supabase
        .from("lavori")
        .update({ prezzo: u.prezzo ?? null })
        .eq("id", u.id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Non autorizzato" },
      { status: 401 }
    );
  }
}
