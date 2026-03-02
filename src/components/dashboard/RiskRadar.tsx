import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface RiskRadarProps {
  cash: number;
  monthlyBurn: number;
  monthlyRevenue: number;
  burnVariation: number;
}

export const RiskRadar = ({
  cash,
  monthlyBurn,
  monthlyRevenue,
  burnVariation
}: RiskRadarProps) => {

  const netBurn = monthlyBurn - monthlyRevenue;
  const runway = netBurn <= 0 ? 100 : cash / netBurn;

  // Normalize scores (0 = High risk, 100 = Low risk)
  const liquidityScore = Math.min(100, Math.max(0, (runway / 12) * 100));
  const volatilityScore = Math.min(100, Math.max(0, 100 - (Math.abs(burnVariation) * 5)));
  const growthScore = Math.min(100, Math.max(0, (monthlyRevenue / (monthlyBurn || 1)) * 100));
  const stabilityScore = "80"; // Simplified for this prototype

  const data = [
    { subject: "Liquidez", A: liquidityScore, fullMark: 100 },
    { subject: "Volatilidad", A: volatilityScore, fullMark: 100 },
    { subject: "Crecimiento", A: growthScore, fullMark: 100 },
    { subject: "Estabilidad", A: parseInt(stabilityScore), fullMark: 100 }
  ];

  return (
    <Card className="col-span-1 md:col-span-3 glass-panel border-muted/20 h-full flex flex-col items-center">
      <CardHeader className="w-full text-center pb-0">
        <CardTitle className="text-xl font-light text-muted-foreground uppercase tracking-widest">
          Risk Radar
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full h-[250px] mt-4 p-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Riesgo"
              dataKey="A"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
