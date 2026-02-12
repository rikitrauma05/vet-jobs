import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID mancante" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("lavori")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Non autorizzato" },
      { status: 401 }
    );
  }
}
