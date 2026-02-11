import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DebugProfilePage() {
  const supabase = await createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return (
      <div className="card">
        <h1>Debug Profile</h1>
        <pre>NOT LOGGED IN</pre>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id);

  return (
    <div className="card">
      <h1>Debug Profile</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>
{JSON.stringify(
  {
    userId: userData.user.id,
    profile: data,
    error: error?.message ?? null,
  },
  null,
  2
)}
      </pre>
    </div>
  );
}
