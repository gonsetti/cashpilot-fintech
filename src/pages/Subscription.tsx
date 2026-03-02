import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

export default function Subscription() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) navigate("/login");
    });
  }, [navigate]);

  const sub = useSubscription(user?.id);

  const handlePayment = async () => {
    setPaying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/create-preference`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        console.error("No init_point:", data);
      }
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setPaying(false);
    }
  };

  if (loading || sub.status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  // If user has access, redirect to dashboard
  if (sub.hasAccess && !status) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 font-bold text-xl text-foreground mb-10 justify-center">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-icons text-primary-foreground text-base">trending_up</span>
          </div>
          Sovereign Atlas
        </Link>

        {status === "success" && (
          <div className="bg-fintech-green/10 border border-fintech-green/20 rounded-xl p-6 mb-6 text-center">
            <span className="material-icons text-fintech-green text-4xl mb-3 block">check_circle</span>
            <h2 className="text-lg font-bold text-foreground mb-2">¡Pago exitoso!</h2>
            <p className="text-sm text-muted-foreground mb-4">Tu suscripción está activa. Ya puedes usar Sovereign Atlas.</p>
            <Link
              to="/dashboard"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors"
            >
              Ir al dashboard
            </Link>
          </div>
        )}

        {status === "failure" && (
          <div className="bg-fintech-red/10 border border-fintech-red/20 rounded-xl p-6 mb-6 text-center">
            <span className="material-icons text-fintech-red text-4xl mb-3 block">error</span>
            <h2 className="text-lg font-bold text-foreground mb-2">Pago rechazado</h2>
            <p className="text-sm text-muted-foreground mb-4">Tu pago no pudo ser procesado. Intenta nuevamente.</p>
          </div>
        )}

        {status === "pending" && (
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-6 mb-6 text-center">
            <span className="material-icons text-yellow-400 text-4xl mb-3 block">schedule</span>
            <h2 className="text-lg font-bold text-foreground mb-2">Pago pendiente</h2>
            <p className="text-sm text-muted-foreground mb-4">Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>
            <Link
              to="/dashboard"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors"
            >
              Ir al dashboard
            </Link>
          </div>
        )}

        {!status && (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <span className="material-icons text-primary text-4xl mb-4 block">lock</span>
            <h1 className="text-2xl font-bold text-foreground mb-2">Tu prueba gratuita terminó</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Suscríbete al Plan Fundadores para seguir usando Sovereign Atlas.
            </p>

            <div className="bg-secondary/50 rounded-lg p-5 mb-6 text-left">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Plan Fundadores</h3>
                <div className="text-right">
                  <span className="text-2xl font-bold text-foreground">$29</span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  "5 cuentas conectadas",
                  "Forecast de runway a 12 meses",
                  "Alertas inteligentes",
                  "Soporte prioritario",
                  "Exportar reportes",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="material-icons text-primary text-base">check</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handlePayment}
              disabled={paying}
              className="w-full py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {paying ? "Redirigiendo a MercadoPago..." : "Suscribirme con MercadoPago"}
            </button>

            <p className="text-xs text-muted-foreground mt-4">
              Suscripción mensual recurrente. Pago seguro procesado por MercadoPago. Acepta Visa, Mastercard y más. Puedes cancelar en cualquier momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
