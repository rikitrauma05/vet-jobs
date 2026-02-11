import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DebugAuthPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.getUser();

  return (
    <div className="card">
      <h1>Debug Auth</h1>

      <pre style={{ whiteSpace: "pre-wrap" }}>
{JSON.stringify(
  {
    user: data?.user ?? null,
    error: error?.message ?? null,
  },
  null,
  2
)}
      </pre>
    </div>
  );
}
