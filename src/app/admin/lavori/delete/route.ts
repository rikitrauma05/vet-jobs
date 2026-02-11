import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { id } = await req.json();
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("lavori")
    .delete()
    .eq("id", id);

  return NextResponse.json({ success: true });
}
