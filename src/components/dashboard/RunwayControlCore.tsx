import { useMemo } from "react";

type Props = {
  runway: number;
  burnRate: number;
  cashAvailable: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  previousRunway: number | null;
};

function getDepletionDate(runwayMonths: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + Math.floor(runwayMonths));
  return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

function RiskGauge({ runway }: { runway: number }) {
  // Gauge from 0 to 24 months, 180 degree arc
  const maxMonths = 24;
  const clamped = Math.min(Math.max(runway, 0), maxMonths);
  const percentage = clamped / maxMonths;
  
  // SVG arc calculations
  const cx = 120, cy = 110, r = 90;
  const startAngle = Math.PI; // left
  const endAngle = 0; // right
  const currentAngle = Math.PI - percentage * Math.PI;
  
  const arcPath = (from: number, to: number) => {
    const x1 = cx + r * Math.cos(from);
    const y1 = cy - r * Math.sin(from);
    const x2 = cx + r * Math.cos(to);
    const y2 = cy - r * Math.sin(to);
    const largeArc = from - to > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Needle position
  const needleX = cx + (r - 10) * Math.cos(currentAngle);
  const needleY = cy - (r - 10) * Math.sin(currentAngle);

  // Color zones: red (0-3), yellow (3-9), green (9-24)
  const getColor = () => {
    if (runway < 4) return "hsl(0, 84%, 60%)";
    if (runway < 9) return "hsl(45, 93%, 47%)";
    return "hsl(142, 71%, 45%)";
  };

  return (
    <svg viewBox="0 0 240 130" className="w-full max-w-[200px] mx-auto">
      {/* Background arc */}
      <path d={arcPath(Math.PI, 0)} fill="none" stroke="hsl(215, 19%, 16%)" strokeWidth="12" strokeLinecap="round" />
      {/* Red zone */}
      <path d={arcPath(Math.PI, Math.PI - (3/24)*Math.PI)} fill="none" stroke="hsl(0, 84%, 60%)" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
      {/* Yellow zone */}
      <path d={arcPath(Math.PI - (3/24)*Math.PI, Math.PI - (9/24)*Math.PI)} fill="none" stroke="hsl(45, 93%, 47%)" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
      {/* Green zone */}
      <path d={arcPath(Math.PI - (9/24)*Math.PI, 0)} fill="none" stroke="hsl(142, 71%, 45%)" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
      {/* Active arc */}
      {percentage > 0.01 && (
        <path d={arcPath(Math.PI, currentAngle)} fill="none" stroke={getColor()} strokeWidth="12" strokeLinecap="round" />
      )}
      {/* Needle dot */}
      <circle cx={needleX} cy={needleY} r="5" fill={getColor()} />
      <circle cx={needleX} cy={needleY} r="3" fill="hsl(220, 20%, 7%)" />
      {/* Labels */}
      <text x="30" y="125" fill="hsl(218, 11%, 65%)" fontSize="9" fontFamily="Inter">0</text>
      <text x="200" y="125" fill="hsl(218, 11%, 65%)" fontSize="9" fontFamily="Inter">24m</text>
    </svg>
  );
}

function RiskLevel({ runway }: { runway: number }) {
  const level = runway > 9 ? "low" : runway >= 4 ? "medium" : "high";
  const config = {
    low: { label: "Bajo", color: "text-fintech-green", bg: "bg-fintech-green/10", border: "border-fintech-green/20", dot: "bg-fintech-green" },
    medium: { label: "Medio", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", dot: "bg-yellow-400" },
    high: { label: "Alto", color: "text-fintech-red", bg: "bg-fintech-red/10", border: "border-fintech-red/20", dot: "bg-fintech-red" },
  }[level];

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border}`}>
      <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      <span className={`text-xs font-semibold ${config.color} uppercase tracking-wider`}>Riesgo {config.label}</span>
    </div>
  );
}

export default function RunwayControlCore({ runway, burnRate, cashAvailable, monthlyRevenue, monthlyExpenses, previousRunway }: Props) {
  const isInfinite = !isFinite(runway);
  const netFlow = monthlyRevenue - monthlyExpenses;
  const burnChange = previousRunway != null && isFinite(runway) ? runway - previousRunway : null;
  const burnChangePercent = previousRunway != null && previousRunway > 0 ? (((runway - previousRunway) / previousRunway) * 100).toFixed(1) : null;
  const isSustainable = netFlow >= 0;

  const healthColor = useMemo(() => {
    if (isInfinite || runway > 9) return "text-fintech-green";
    if (runway >= 4) return "text-yellow-400";
    return "text-fintech-red";
  }, [runway, isInfinite]);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
      {/* Header bar */}
      <div className="px-6 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-icons text-primary text-base">flight</span>
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">Runway Control</span>
        </div>
        {!isInfinite && <RiskLevel runway={runway} />}
      </div>

      <div className="p-6 sm:p-8">
        {isSustainable && isInfinite ? (
          /* Sustainable mode */
          <div className="text-center">
            <div className="text-7xl sm:text-8xl font-black text-fintech-green tracking-tight mb-2">∞</div>
            <p className="text-lg font-semibold text-foreground mb-1">Crecimiento sostenible</p>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              No estás quemando capital. Tus ingresos cubren tus gastos con un flujo neto de <strong className="text-fintech-green">+${netFlow.toLocaleString()}/mes</strong>.
            </p>
          </div>
        ) : (
          /* Burn mode */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
            {/* Left: Runway number */}
            <div className="text-center lg:text-left">
              <div className={`text-7xl sm:text-8xl lg:text-[7rem] font-black tracking-tighter ${healthColor} leading-none mb-3`}>
                {runway.toFixed(1)}
                <span className="text-2xl sm:text-3xl font-semibold ml-2 text-muted-foreground">meses</span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 max-w-lg">
                Al ritmo actual, tu capital se agotará el <strong className="text-foreground">{getDepletionDate(runway)}</strong>.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <div>
                  <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-0.5">Burn mensual</div>
                  <div className="text-lg font-bold text-foreground">${burnRate.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-0.5">Variación</div>
                  <div className={`text-lg font-bold flex items-center gap-1 ${burnChange != null && burnChange > 0 ? "text-fintech-green" : burnChange != null && burnChange < 0 ? "text-fintech-red" : "text-muted-foreground"}`}>
                    {burnChangePercent != null ? (
                      <>
                        <span className="material-icons text-sm">{Number(burnChangePercent) > 0 ? "arrow_upward" : "arrow_downward"}</span>
                        {Math.abs(Number(burnChangePercent))}%
                      </>
                    ) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-0.5">Cash</div>
                  <div className="text-lg font-bold text-foreground">${cashAvailable.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Right: Gauge */}
            <div className="flex flex-col items-center">
              <RiskGauge runway={runway} />
              <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mt-1">Indicador de riesgo</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
