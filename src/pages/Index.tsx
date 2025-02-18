
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccessibleTypingTutor from "../components/AccessibleTypingTutor";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      // If we're on the index page and there's no session, redirect to auth
      if (!session?.user) {
        console.log("No session detected, redirecting to auth");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">DeepType AI</h1>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-sm text-secondary">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg border border-primary/50 hover:bg-primary/10 transition-all duration-200"
                aria-label="Sign out"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="px-4 py-2 rounded-lg border border-primary/50 hover:bg-primary/10 transition-all duration-200"
              aria-label="Sign in to track your progress"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
      
      <AccessibleTypingTutor />
    </div>
  );
};

export default Index;
