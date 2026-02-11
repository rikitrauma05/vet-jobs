import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const formData = await req.formData();
  const userId = formData.get("userId") as string;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Elimina da auth
  await supabaseAdmin.auth.admin.deleteUser(userId);

  // Elimina profilo
  await supabaseAdmin.from("profiles").delete().eq("id", userId);

  return NextResponse.redirect(new URL("/admin", req.url));
}
