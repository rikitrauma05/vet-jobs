import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "UserId mancante" }, { status: 400 });
    }

    // 🔎 0️⃣ Recupero utente corrente (chi sta facendo la richiesta)
    const supabaseServer = await createSupabaseServerClient();
    const {
      data: { user: currentUser },
    } = await supabaseServer.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
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

    // 🔎 1️⃣ Controlliamo se è admin
    const { data: userData } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (userData?.role === "admin") {
      // 🔎 2️⃣ Contiamo quanti admin esistono
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

    // 3️⃣ Elimina profilo
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 4️⃣ Elimina da auth
    await supabaseAdmin.auth.admin.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
