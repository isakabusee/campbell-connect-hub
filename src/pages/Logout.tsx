import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Logout = () => {
  useEffect(() => {
    let redirected = false;
    const finish = () => {
      if (redirected) return;
      redirected = true;
      window.location.href = "/";
    };

    // Never hang on sign-out: redirect after 3s no matter what.
    const timeout = setTimeout(finish, 3000);

    (async () => {
      try {
        // signOut clears the session through the client's storage adapter,
        // which also clears the brokered preview copy — removing the key from
        // raw localStorage alone would let the session resurrect.
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        // ignore — we clear local state below regardless
      }
      // Belt-and-braces: drop any lingering auth keys from localStorage.
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sb-") && k.endsWith("-auth-token"))
        .forEach((k) => localStorage.removeItem(k));
      clearTimeout(timeout);
      finish();
    })();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="font-body text-muted-foreground">Signing out…</p>
    </div>
  );
};

export default Logout;
