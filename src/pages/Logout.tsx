import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Logout = () => {
  useEffect(() => {
    // Force-clear session from localStorage immediately
    const storageKey = Object.keys(localStorage).find((k) =>
      k.startsWith("sb-") && k.endsWith("-auth-token")
    );
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }

    // Attempt signOut but don't wait on it indefinitely
    const timeout = setTimeout(() => {
      window.location.href = "/";
    }, 2000);

    supabase.auth
      .signOut({ scope: "local" })
      .then(() => {
        clearTimeout(timeout);
        window.location.href = "/";
      })
      .catch(() => {
        clearTimeout(timeout);
        window.location.href = "/";
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="font-body text-muted-foreground">Signing out…</p>
    </div>
  );
};

export default Logout;
