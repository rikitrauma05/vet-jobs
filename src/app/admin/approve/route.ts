import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const formData = await request.formData();

  const userId = formData.get("userId") as string;
  const approved = formData.get("approved") === "true";

  if (!userId) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  await supabase
    .from("profiles")
    .update({ approved })
    .eq("id", userId);

  return NextResponse.redirect(new URL("/admin", request.url));
}
