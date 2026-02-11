import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const updates = await req.json();
  const supabase = await createSupabaseServerClient();

  for (const u of updates) {
    await supabase
      .from("lavori")
      .update({ prezzo: u.prezzo })
      .eq("id", u.id);
  }

  return NextResponse.json({ success: true });
}
