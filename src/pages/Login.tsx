import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-3 font-bold text-xl text-foreground mb-10 justify-center group">
          <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <span className="material-icons text-emerald-500 text-lg">insights</span>
          </div>
          CashPilot
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Bienvenido</h1>
        <p className="text-muted-foreground text-sm mb-8 text-center">Accede a tu dashboard financiero</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-muted-foreground"
              placeholder="tu@empresa.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">Contraseña</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-muted-foreground"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Acceder al Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
