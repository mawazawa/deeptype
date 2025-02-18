
import { useNavigate } from "react-router-dom";
import AccessibleTypingTutor from "../components/AccessibleTypingTutor";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="p-4 flex justify-end">
        <button
          onClick={() => navigate("/auth")}
          className="px-4 py-2 rounded-lg border border-primary/50 hover:bg-primary/10 transition-all duration-200"
          aria-label="Sign in to track your progress"
        >
          Sign In
        </button>
      </nav>
      
      <AccessibleTypingTutor />
    </div>
  );
};

export default Index;
