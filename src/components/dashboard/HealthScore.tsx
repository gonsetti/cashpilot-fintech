import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface HealthScoreProps {
  cash: number;
  monthlyBurn: number;
  monthlyRevenue: number;
  burnVariation: number;
}

export const HealthScore = ({
  cash,
  monthlyBurn,
  monthlyRevenue,
  burnVariation
}: HealthScoreProps) => {

  const netBurn = monthlyBurn - monthlyRevenue;
  const runway = netBurn <= 0 ? 100 : cash / netBurn;

  // Weighted score calculation (max 100)
  // Runway: 50%
  const runwayFactor = Math.min(50, (runway / 12) * 50);

  // Trend: 25% (punishes high burn variation)
  const trendFactor = Math.max(0, 25 - (burnVariation > 0 ? burnVariation * 1.5 : 0));

  // Ratio: 25% (revenue / burn)
  const ratioFactor = Math.min(25, (monthlyRevenue / (monthlyBurn || 1)) * 25);

  const totalScore = Math.floor(runwayFactor + trendFactor + ratioFactor);

  let statusText = "";
  let colorClass = "";

  if (totalScore >= 80) {
    statusText = "Excelente salud financiera. Default Alive.";
    colorClass = "text-fintech-green";
  } else if (totalScore >= 50) {
    statusText = "Salud moderada. Mantén vigilancia sobre el burn y prioriza crecimiento.";
    colorClass = "text-yellow-500";
  } else {
    statusText = "Crítico. Riesgo de default inminente. Acción drástica requerida.";
    colorClass = "text-fintech-red";
  }

  // Generate SVG conic gradient angle
  const angle = (totalScore / 100) * 360;

  return (
    <Card className="col-span-1 md:col-span-3 glass-panel border-muted/20 h-full flex flex-col justify-center items-center relative overflow-hidden">
      <CardHeader className="w-full text-center pb-2 z-10">
        <CardTitle className="text-xl font-light text-muted-foreground uppercase tracking-widest">
          Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full flex flex-col items-center justify-center p-6 z-10">

        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${(totalScore / 100) * 283} 283`}
              strokeLinecap="round"
              className={colorClass}
              style={{ transition: "stroke-dasharray 1s ease-in-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold tracking-tighter ${colorClass}`}>
              {totalScore}
            </span>
            <span className="text-xs text-muted-foreground uppercase mt-1">/ 100</span>
          </div>
        </div>

        <p className="text-sm text-center text-muted-foreground font-medium px-4">
          {statusText}
        </p>

      </CardContent>
    </Card>
  );
};
