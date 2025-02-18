
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      toast({
        title: "Magic link sent!",
        description: "Check your email for the login link",
        duration: 5000,
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">DeepType AI</h1>
          <h2 className="text-2xl mt-4">Welcome Back</h2>
          <p className="mt-2 text-secondary">Sign in to track your progress</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg border border-border bg-background/50 backdrop-blur-lg"
              aria-label="Email address"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-lg bg-primary/10 border border-primary hover:bg-primary/20 transition-all duration-200"
            aria-label={loading ? "Sending magic link..." : "Send magic link"}
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="w-full p-3 text-secondary hover:text-primary transition-colors"
          aria-label="Return to home page"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default Auth;
