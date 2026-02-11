import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const formData = await req.formData();
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabaseAdmin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  return NextResponse.redirect(new URL("/admin", req.url));
}
