type Props = {
  runway: number;
  burnRate: number;
  cashAvailable: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  previousRunway: number | null;
};

type Insight = {
  icon: string;
  title: string;
  description: string;
  type: "warning" | "success" | "info" | "danger";
};

function generateInsights({ runway, burnRate, cashAvailable, monthlyRevenue, monthlyExpenses, previousRunway }: Props): Insight[] {
  const insights: Insight[] = [];
  const netFlow = monthlyRevenue - monthlyExpenses;
  const isInfinite = !isFinite(runway);

  // 10% expense reduction simulation
  if (burnRate > 0 && !isInfinite) {
    const reducedBurn = burnRate * 0.9;
    const newRunway = cashAvailable / reducedBurn;
    const gain = newRunway - runway;
    insights.push({
      icon: "savings",
      title: "Optimización de gastos",
      description: `Reduciendo gastos un 10% ($${Math.round(monthlyExpenses * 0.1).toLocaleString()}/mes), extenderías tu runway en ${gain.toFixed(1)} meses adicionales.`,
      type: "info",
    });
  }

  // Runway warning
  if (!isInfinite && runway < 6) {
    insights.push({
      icon: "warning",
      title: "Runway bajo",
      description: `Con menos de 6 meses de runway, deberías considerar reducir costos o buscar financiamiento adicional de manera urgente.`,
      type: runway < 3 ? "danger" : "warning",
    });
  }

  // Burn rate increase
  if (previousRunway != null && !isInfinite && runway < previousRunway) {
    const drop = ((previousRunway - runway) / previousRunway * 100).toFixed(0);
    insights.push({
      icon: "trending_down",
      title: "Runway en descenso",
      description: `Tu runway cayó un ${drop}% respecto al período anterior. Revisa los gastos que aumentaron recientemente.`,
      type: "warning",
    });
  }

  // Positive net flow
  if (netFlow > 0 && !isInfinite) {
    insights.push({
      icon: "trending_up",
      title: "Flujo positivo detectado",
      description: `Generas +$${netFlow.toLocaleString()}/mes de flujo neto. Si mantienes esta tendencia, podrías alcanzar sustentabilidad.`,
      type: "success",
    });
  }

  // Cash buffer analysis
  if (burnRate > 0) {
    const monthsOfBuffer = cashAvailable / monthlyExpenses;
    if (monthsOfBuffer > 12) {
      insights.push({
        icon: "shield",
        title: "Reserva sólida",
        description: `Tu cash cubre ${monthsOfBuffer.toFixed(0)} meses de gastos operativos. Estás en una posición financiera estable.`,
        type: "success",
      });
    }
  }

  // Revenue-to-expense ratio
  if (monthlyExpenses > 0) {
    const ratio = monthlyRevenue / monthlyExpenses;
    if (ratio >= 1) {
      insights.push({
        icon: "check_circle",
        title: "Ingresos cubren gastos",
        description: `Tu ratio ingresos/gastos es ${ratio.toFixed(2)}x. Estás operando de forma sostenible.`,
        type: "success",
      });
    }
  }

  return insights.slice(0, 4); // Max 4 insights
}

const typeConfig = {
  danger: { bg: "bg-fintech-red/5", border: "border-fintech-red/15", iconColor: "text-fintech-red" },
  warning: { bg: "bg-yellow-400/5", border: "border-yellow-400/15", iconColor: "text-yellow-400" },
  success: { bg: "bg-fintech-green/5", border: "border-fintech-green/15", iconColor: "text-fintech-green" },
  info: { bg: "bg-primary/5", border: "border-primary/15", iconColor: "text-primary" },
};

export default function CashPilotAtlasInsights(props: Props) {
  const insights = generateInsights(props);

  if (insights.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-icons text-primary text-base">auto_awesome</span>
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">CashPilot Insights</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((insight, i) => {
          const tc = typeConfig[insight.type];
          return (
            <div
              key={i}
              className={`${tc.bg} border ${tc.border} rounded-xl p-4 transition-all duration-300 hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-3">
                <span className={`material-icons ${tc.iconColor} text-lg mt-0.5 shrink-0`}>{insight.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{insight.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
