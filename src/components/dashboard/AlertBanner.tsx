type Props = {
  runway: number;
  burnRate: number;
  cashAvailable: number;
  previousRunway: number | null;
  previousCash?: number | null;
};

type Alert = {
  icon: string;
  message: string;
  level: "red" | "yellow" | "green";
};

function getAlerts({ runway, burnRate, previousRunway, cashAvailable }: Props): Alert[] {
  const alerts: Alert[] = [];
  const isInfinite = !isFinite(runway);

  if (!isInfinite && runway < 3) {
    alerts.push({
      icon: "error",
      message: "Riesgo crítico: menos de 3 meses de runway. Toma acción inmediata.",
      level: "red",
    });
  }

  if (previousRunway != null && isFinite(runway) && previousRunway > 0) {
    const burnChange = ((previousRunway - runway) / previousRunway) * 100;
    if (burnChange > 10) {
      alerts.push({
        icon: "trending_down",
        message: `Tu runway cayó un ${burnChange.toFixed(0)}% respecto al período anterior.`,
        level: "yellow",
      });
    }
  }

  if (!isInfinite && runway >= 9) {
    alerts.push({
      icon: "check_circle",
      message: "Runway saludable. Tu operación tiene buen margen financiero.",
      level: "green",
    });
  }

  return alerts;
}

const levelConfig = {
  red: { bg: "bg-fintech-red/8", border: "border-fintech-red/20", icon: "text-fintech-red", text: "text-foreground" },
  yellow: { bg: "bg-yellow-400/8", border: "border-yellow-400/20", icon: "text-yellow-400", text: "text-foreground" },
  green: { bg: "bg-fintech-green/8", border: "border-fintech-green/20", icon: "text-fintech-green", text: "text-foreground" },
};

export default function AlertBanner(props: Props) {
  const alerts = getAlerts(props);
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((alert, i) => {
        const lc = levelConfig[alert.level];
        return (
          <div key={i} className={`${lc.bg} border ${lc.border} rounded-xl px-4 py-3 flex items-center gap-3 transition-all`}>
            <span className={`material-icons ${lc.icon} text-lg shrink-0`}>{alert.icon}</span>
            <p className={`text-sm font-medium ${lc.text}`}>{alert.message}</p>
          </div>
        );
      })}
    </div>
  );
}
