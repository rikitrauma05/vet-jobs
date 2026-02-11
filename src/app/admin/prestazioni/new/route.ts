import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const formData = await request.formData();

  const nome = formData.get("nome") as string | null;

  if (!nome || nome.trim() === "") {
    return NextResponse.redirect(new URL("/admin/prestazioni", request.url));
  }

  const { error } = await supabase.from("prestazioni").insert({
    nome: nome.trim(),
  });

  if (error) {
    console.error("Errore inserimento prestazione:", error.message);
  }

  return NextResponse.redirect(new URL("/admin/prestazioni", request.url));
}
