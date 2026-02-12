import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const currentUser = await requireAdmin();

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Dati mancanti" },
        { status: 400 }
      );
    }

    // ❌ Non permettere di modificare sé stessi
    if (currentUser.id === userId) {
      return NextResponse.json(
        { error: "Non puoi modificare il tuo ruolo" },
        { status: 400 }
      );
    }

    // Solo ruoli validi
    if (!["admin", "vet"].includes(role)) {
      return NextResponse.json(
        { error: "Ruolo non valido" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Se stiamo togliendo un admin, verifichiamo che non sia l'ultimo
    if (role !== "admin") {
      const { data: targetUser } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (targetUser?.role === "admin") {
        const { count } = await supabaseAdmin
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "admin");

        if (count === 1) {
          return NextResponse.json(
            { error: "Non puoi rimuovere l'ultimo admin" },
            { status: 400 }
          );
        }
      }
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role })
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
