import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContext {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthCtx = createContext<AuthContext>({ user: null, isAdmin: false, loading: true });

export const useAuth = () => useContext(AuthCtx);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let receivedEvent = false;

    const applySession = async (session: Session | null) => {
      const currentUser = session?.user ?? null;
      if (!active) return;
      setUser(currentUser);

      if (currentUser) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id)
          .eq("role", "admin")
          .maybeSingle();
        if (!active) return;
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        receivedEvent = true;
        void applySession(session);
      }
    );

    // Also seed from the stored session, so a signed-out visitor is never left
    // showing the signed-in menu just because the change event didn't arrive.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!receivedEvent) void applySession(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthCtx.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthCtx.Provider>
  );
};
