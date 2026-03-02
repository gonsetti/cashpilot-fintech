import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

export interface ScenarioEngineProps {
    cash: number;
    monthlyBurn: number;
    monthlyRevenue: number;
    expenseReduction: number;
    revenueIncrease: number;
    onExpenseReductionChange: (val: number) => void;
    onRevenueIncreaseChange: (val: number) => void;
}

export const ScenarioEngine = ({
    cash,
    monthlyBurn,
    monthlyRevenue,
    expenseReduction,
    revenueIncrease,
    onExpenseReductionChange,
    onRevenueIncreaseChange,
}: ScenarioEngineProps) => {

    const baseNetBurn = monthlyBurn - monthlyRevenue;
    const baseRunway = baseNetBurn <= 0 ? Infinity : cash / baseNetBurn;

    // Optimistic = User inputs applied (reduction + increase)
    const optBurn = monthlyBurn * (1 - expenseReduction / 100);
    const optRev = monthlyRevenue * (1 + revenueIncrease / 100);
    const optNetBurn = optBurn - optRev;
    const optRunway = optNetBurn <= 0 ? Infinity : cash / optNetBurn;

    // Conservative = 50% of the User inputs applied
    const consBurn = monthlyBurn * (1 - (expenseReduction / 2) / 100);
    const consRev = monthlyRevenue * (1 + (revenueIncrease / 2) / 100);
    const consNetBurn = consBurn - consRev;
    const consRunway = consNetBurn <= 0 ? Infinity : cash / consNetBurn;

    const getRiskColor = (runway: number) => {
        if (runway === Infinity || runway > 9) return "text-fintech-green";
        if (runway >= 4) return "text-yellow-500";
        return "text-fintech-red";
    };

    const formatRunway = (runway: number) =>
        runway === Infinity ? "∞" : `${runway.toFixed(1)}m`;

    return (
        <Card className="col-span-1 md:col-span-4 glass-panel border-accent/20 h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl font-light text-muted-foreground uppercase tracking-widest">
                    Scenario Engine
                </CardTitle>
                <CardDescription>Simulación en memoria sin afectar datos reales.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-foreground">Reducir Gastos</label>
                            <span className="text-sm text-muted-foreground">{expenseReduction}%</span>
                        </div>
                        <Slider
                            value={[expenseReduction]}
                            max={100}
                            step={1}
                            onValueChange={(vals) => onExpenseReductionChange(vals[0])}
                            className="[&_[role=slider]]:bg-primary"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-foreground">Aumentar Ingresos</label>
                            <span className="text-sm text-muted-foreground">{revenueIncrease}%</span>
                        </div>
                        <Slider
                            value={[revenueIncrease]}
                            max={100}
                            step={1}
                            onValueChange={(vals) => onRevenueIncreaseChange(vals[0])}
                            className="[&_[role=slider]]:bg-fintech-green"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50 bg-background/30 p-4 rounded-lg">
                    <div className="text-center">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Base</p>
                        <p className={`text-xl font-bold ${getRiskColor(baseRunway)}`}>{formatRunway(baseRunway)}</p>
                    </div>
                    <div className="text-center border-l border-r border-border/50">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Conservador</p>
                        <p className={`text-xl font-bold ${getRiskColor(consRunway)}`}>{formatRunway(consRunway)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs uppercase tracking-wider text-primary mb-1">Optimista</p>
                        <p className={`text-xl font-bold ${getRiskColor(optRunway)}`}>{formatRunway(optRunway)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
