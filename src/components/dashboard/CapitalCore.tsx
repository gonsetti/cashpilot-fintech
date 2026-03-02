import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addMonths } from "date-fns";
import { es } from "date-fns/locale";

interface CapitalCoreProps {
  cash: number;
  monthlyBurn: number;
  monthlyRevenue: number;
  burnVariation: number;
}

export const CapitalCore = ({ cash, monthlyBurn, monthlyRevenue, burnVariation }: CapitalCoreProps) => {
  const netBurn = monthlyBurn - monthlyRevenue;
  const isProfitable = netBurn <= 0;
  const runwayMonths = isProfitable ? Infinity : cash / netBurn;

  // Determination of Risk
  let riskLevel: "Safe" | "Warning" | "Critical";
  let colorClass: string;
  let runwayText: string;

  if (isProfitable) {
    riskLevel = "Safe";
    colorClass = "text-fintech-green";
    runwayText = "Crecimiento sostenible. No estás quemando capital.";
  } else {
    const depletionDate = addMonths(new Date(), runwayMonths);
    runwayText = `Al ritmo actual, tu capital se agotará en ${format(depletionDate, "MMMM 'de' yyyy", { locale: es })}`;
    
    if (runwayMonths > 9) {
      riskLevel = "Safe";
      colorClass = "text-fintech-green";
    } else if (runwayMonths >= 4) {
      riskLevel = "Warning";
      colorClass = "text-yellow-500";
    } else {
      riskLevel = "Critical";
      colorClass = "text-fintech-red";
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  return (
    <Card className="col-span-1 md:col-span-6 glass-panel border-primary/20 bg-background/50 h-full flex flex-col justify-center">
      <CardHeader>
        <CardTitle className="text-xl font-light text-muted-foreground uppercase tracking-widest">
          Capital Core
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div>
            <div className={`text-6xl font-bold tracking-tighter ${colorClass}`}>
              {isProfitable ? "Infinito" : `${runwayMonths.toFixed(1)} Meses`}
            </div>
            <p className="text-muted-foreground mt-2 text-lg">
              {runwayText}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 mt-6 border-t border-border/50">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Cash Disponible</p>
              <p className="text-2xl font-semibold text-foreground">{formatCurrency(cash)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Burn Mensual</p>
              <p className="text-2xl font-semibold text-foreground">{formatCurrency(monthlyBurn)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Ingresos</p>
              <p className="text-2xl font-semibold text-foreground">{formatCurrency(monthlyRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Var. Burn</p>
              <p className={`text-2xl font-semibold ${burnVariation <= 0 ? "text-fintech-green" : "text-fintech-red"}`}>
                {burnVariation > 0 ? "+" : ""}{burnVariation}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
