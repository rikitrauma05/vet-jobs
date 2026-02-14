import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();

  const cliente_id = formData.get("cliente_id") as string | null;
  const prestazione_id = formData.get("prestazione_id") as string | null;
  const descrizione = formData.get("descrizione") as string | null;
  const data_prestazione = formData.get(
    "data_prestazione"
  ) as string | null;

  if (!cliente_id || !prestazione_id) {
    return NextResponse.redirect(
      new URL("/vet/lavori", request.url)
    );
  }

  await supabase.from("lavori").insert({
    vet_id: user.id,
    cliente_id,
    prestazione_id,
    descrizione: descrizione?.trim() || null,
    data_prestazione:
      data_prestazione && data_prestazione !== ""
        ? data_prestazione
        : null,
  });

  return NextResponse.redirect(
    new URL("/vet/lavori", request.url)
  );
}
