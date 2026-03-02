import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-icons text-primary text-2xl">mail</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Revisa tu email</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Si existe una cuenta con <strong className="text-foreground">{email}</strong>, recibirás un enlace para restablecer tu contraseña.
          </p>
          <Link to="/login" className="text-primary text-sm font-medium hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-3 font-bold text-xl text-foreground mb-10 justify-center">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-icons text-primary-foreground text-base">trending_up</span>
          </div>
          Sovereign Atlas
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Recuperar contraseña</h1>
        <p className="text-muted-foreground text-sm mb-8 text-center">Te enviaremos un enlace para restablecerla</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              placeholder="tu@empresa.com"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <p className="text-muted-foreground text-sm text-center mt-6">
          <Link to="/login" className="text-primary hover:underline font-medium">Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
}
