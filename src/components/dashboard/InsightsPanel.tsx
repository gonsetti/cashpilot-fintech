import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Info, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import { useMemo } from "react";

interface InsightsPanelProps {
    cash: number;
    monthlyBurn: number;
    monthlyRevenue: number;
    expenseReduction: number;
    revenueIncrease: number;
    burnVariation: number;
}

export const InsightsPanel = ({
    cash,
    monthlyBurn,
    monthlyRevenue,
    expenseReduction,
    revenueIncrease,
    burnVariation
}: InsightsPanelProps) => {

    const insights = useMemo(() => {
        const items = [];
        const baseNetBurn = monthlyBurn - monthlyRevenue;
        const baseRunway = baseNetBurn <= 0 ? Infinity : cash / baseNetBurn;

        // 1. Critical Zone Insight
        if (baseRunway !== Infinity && baseRunway <= 3) {
            items.push({
                id: "critical",
                icon: AlertTriangle,
                color: "text-fintech-red bg-red-950/30 border-fintech-red/20",
                message: `Base runway is dropping below 3 months. Cash will deplete in approx ${Math.floor(baseRunway)} months. Immediate action required.`,
            });
        }

        // 2. Burn trend
        if (burnVariation > 10) {
            items.push({
                id: "burn-up",
                icon: TrendingUp,
                color: "text-yellow-500 bg-yellow-950/30 border-yellow-500/20",
                message: `Your burn rate increased by ${burnVariation}% over the last 30 days, eating into your runway faster than expected.`,
            });
        } else if (burnVariation < -5) {
            items.push({
                id: "burn-down",
                icon: Info,
                color: "text-fintech-green bg-green-950/30 border-fintech-green/20",
                message: `Great job! Your burn rate decreased by ${Math.abs(burnVariation)}% recently. Keep scaling lean.`,
            });
        }

        // 3. Scenario suggestion
        if (expenseReduction > 0 || revenueIncrease > 0) {
            const optBurn = monthlyBurn * (1 - expenseReduction / 100);
            const optRev = monthlyRevenue * (1 + revenueIncrease / 100);
            const optNetBurn = optBurn - optRev;
            const optRunway = optNetBurn <= 0 ? Infinity : cash / optNetBurn;

            if (baseRunway !== Infinity && optRunway !== Infinity && optRunway > baseRunway) {
                const monthsGained = Math.floor(optRunway - baseRunway);
                if (monthsGained > 0) {
                    items.push({
                        id: "scenario-gain",
                        icon: Lightbulb,
                        color: "text-primary bg-primary/10 border-primary/20",
                        message: `By hitting your simulated targets, you extend your runway by ${monthsGained} months. Focus on executing this scenario.`,
                    });
                }
            } else if (optRunway === Infinity) {
                items.push({
                    id: "scenario-profit",
                    icon: Lightbulb,
                    color: "text-fintech-green bg-green-950/30 border-fintech-green/20",
                    message: `This scenario makes you profitable and stops cash burn completely. You reach default alive.`,
                });
            }
        }

        // Default if no other items
        if (items.length === 0) {
            items.push({
                id: "stable",
                icon: Info,
                color: "text-muted-foreground bg-accent/5 border-border",
                message: "Finances are relatively stable right now. Consider running scenarios to see how you can extend runway.",
            });
        }

        return items;
    }, [cash, monthlyBurn, monthlyRevenue, expenseReduction, revenueIncrease, burnVariation]);

    return (
        <Card className="col-span-1 md:col-span-4 glass-panel border-muted/20 flex flex-col h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-light text-muted-foreground uppercase tracking-widest">
                    Founder Insights
                </CardTitle>
                <CardDescription>Generadas dinámicamente basadas en tus métricas base y simuladas</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2 space-y-3">
                {insights.map(item => {
                    const Icon = item.icon;
                    return (
                        <div key={item.id} className={`p-4 rounded-lg flex gap-3 border ${item.color} backdrop-blur-sm transition-all duration-300`}>
                            <Icon className="w-5 h-5 shrink-0 mt-0.5 opacity-80" />
                            <p className="text-sm font-medium leading-relaxed opacity-90">{item.message}</p>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};
