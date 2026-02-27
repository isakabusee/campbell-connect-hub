import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Logout = () => {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const run = async () => {
      await supabase.auth.signOut();
      setDone(true);
    };

    void run();
  }, []);

  if (done) return <Navigate to="/" replace />;

  return <div className="min-h-screen bg-background" />;
};

export default Logout;

