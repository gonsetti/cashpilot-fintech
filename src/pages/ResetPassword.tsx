import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user arrived via recovery link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");

    if (type === "recovery") {
      setValidSession(true);
      setChecking(false);
      return;
    }

    // Also check if there's already an active session (user clicked the link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session);
      setChecking(false);
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Verificando...</p>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-icons text-destructive text-2xl">error</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Enlace inválido</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Este enlace ha expirado o no es válido. Solicita uno nuevo.
          </p>
          <Link to="/forgot-password" className="text-primary text-sm font-medium hover:underline">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-icons text-primary text-2xl">check_circle</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Contraseña actualizada</h1>
          <p className="text-muted-foreground text-sm">Redirigiendo al dashboard...</p>
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

        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Nueva contraseña</h1>
        <p className="text-muted-foreground text-sm mb-8 text-center">Ingresa tu nueva contraseña</p>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              placeholder="Mín. 6 caracteres"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Confirmar contraseña</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              placeholder="Repite tu contraseña"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
