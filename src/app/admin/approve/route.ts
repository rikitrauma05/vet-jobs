import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const { userId, approved } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "UserId mancante" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("profiles")
      .update({ approved })
      .eq("id", userId);

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
