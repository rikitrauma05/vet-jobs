import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const currentUser = await requireAdmin();

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "UserId mancante" },
        { status: 400 }
      );
    }

    // ❌ Blocca auto-eliminazione
    if (currentUser.id === userId) {
      return NextResponse.json(
        { error: "Non puoi eliminare te stesso" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔎 Verifica se l'utente da eliminare è admin
    const { data: userData } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (userData?.role === "admin") {
      const { count } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      if (count === 1) {
        return NextResponse.json(
          { error: "Non puoi eliminare l'ultimo admin" },
          { status: 400 }
        );
      }
    }

    // Elimina profilo
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Elimina da auth
    await supabaseAdmin.auth.admin.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Non autorizzato" },
      { status: 401 }
    );
  }
}
