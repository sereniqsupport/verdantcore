import { redirect } from "next/navigation";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { InvestoPrivateShell } from "@/components/investo/private-shell";

type ProtectedPageProps = {
  children: React.ReactNode;
};

export async function InvestoProtectedPage({
  children,
}: ProtectedPageProps) {
  /*
   * Fail closed when authentication configuration is unavailable.
   * This prevents protected content from rendering and avoids attempting
   * to construct a Supabase client without valid environment variables.
   */
  if (!hasSupabasePublicConfig()) {
    redirect("/v2/login?configuration=missing");
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/v2/login");
  }

  return (
    <InvestoPrivateShell userEmail={user.email ?? "Authenticated user"}>
      {children}
    </InvestoPrivateShell>
  );
}
