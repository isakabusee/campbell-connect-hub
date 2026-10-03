import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Logout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const doneRef = useRef(false);

  useEffect(() => {
    // Never hang on sign-out: route to sign-in after 3s no matter what.
    const timeout = setTimeout(finish, 3000);

    function finish() {
      if (doneRef.current) return;
      doneRef.current = true;
      clearTimeout(timeout);
      // Drop any lingering auth keys from localStorage — this runs even if
      // signOut() hangs, so the session can never resurrect after sign-out.
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sb-") && k.endsWith("-auth-token"))
        .forEach((k) => localStorage.removeItem(k));
      // Drop cached member/admin data so nothing stale lingers after sign-out.
      queryClient.clear();
      // replace: true means the browser Back button can't return to this page.
      navigate("/login", { replace: true });
      // Fallback: if the route change didn't take, force a fresh load of home.
      setTimeout(() => {
        if (window.location.pathname !== "/login") window.location.replace("/login");
      }, 500);
    }

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
      finish();
    })();

    return () => clearTimeout(timeout);
  }, [navigate, queryClient]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="font-body text-muted-foreground">Signing out…</p>
    </div>
  );
};

export default Logout;
