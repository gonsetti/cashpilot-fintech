import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";
import { addMonths, format } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo } from "react";

interface TrajectoryGraphProps {
    cash: number;
    monthlyBurn: number;
    monthlyRevenue: number;
    expenseReduction: number;
    revenueIncrease: number;
}

export const TrajectoryGraph = ({
    cash,
    monthlyBurn,
    monthlyRevenue,
    expenseReduction,
    revenueIncrease
}: TrajectoryGraphProps) => {

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

    const data = useMemo(() => {
        const points = [];
        let currentBaseCash = cash;
        let currentOptCash = cash;
        let currentConsCash = cash;

        const baseNetBurn = monthlyBurn - monthlyRevenue;

        // Opt burn
        const optBurn = monthlyBurn * (1 - expenseReduction / 100);
        const optRev = monthlyRevenue * (1 + revenueIncrease / 100);
        const optNetBurn = optBurn - optRev;

        // Cons burn
        const consBurn = monthlyBurn * (1 - (expenseReduction / 2) / 100);
        const consRev = monthlyRevenue * (1 + (revenueIncrease / 2) / 100);
        const consNetBurn = consBurn - consRev;

        const today = new Date();

        for (let i = 0; i <= 12; i++) {
            const monthDate = addMonths(today, i);
            points.push({
                month: format(monthDate, "MMM", { locale: es }),
                fullDate: format(monthDate, "MMMM yyyy", { locale: es }),
                // Never drop below 0 for visually pleasing chart
                base: Math.max(0, currentBaseCash),
                optimistic: Math.max(0, currentOptCash),
                conservative: Math.max(0, currentConsCash),
                baseRunway: currentBaseCash / baseNetBurn,
            });

            currentBaseCash -= baseNetBurn;
            currentOptCash -= optNetBurn;
            currentConsCash -= consNetBurn;
        }

        return points;
    }, [cash, monthlyBurn, monthlyRevenue, expenseReduction, revenueIncrease]);

    // Find month where base runway hits 3 threshold to shade critical zone
    const thresholdMonthIndex = data.findIndex(d => d.baseRunway > 0 && d.baseRunway <= 3);
    const criticalMonth = thresholdMonthIndex !== -1 ? data[thresholdMonthIndex].month : null;

    return (
        <Card className="col-span-1 md:col-span-10 glass-panel border-muted/20">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-light text-muted-foreground uppercase tracking-widest">
                            Trajectory Graph
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">Proyección de caja a 12 meses basada en escenarios</CardDescription>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-border mr-2" /> Base</div>
                        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" /> Conservador</div>
                        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-primary mr-2" /> Optimista</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                tickFormatter={(val) => `$${val / 1000}k`}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--muted-foreground))', marginBottom: '8px', textTransform: 'capitalize' }}
                                formatter={(value: number, name: string) => [
                                    formatCurrency(value),
                                    name === 'base' ? 'Base' : name === 'optimistic' ? 'Optimista' : 'Conservador'
                                ]}
                                labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ''}
                            />
                            {criticalMonth && (
                                <ReferenceLine x={criticalMonth} stroke="hsl(var(--destructive))" strokeDasharray="3 3" opacity={0.5}>
                                    <text x={0} y={15} fill="hsl(var(--destructive))" opacity={0.8} fontSize={12}>(!) Zona Crítica</text>
                                </ReferenceLine>
                            )}
                            <Area
                                type="monotone"
                                dataKey="base"
                                stroke="hsl(var(--muted-foreground))"
                                fillOpacity={0}
                                strokeWidth={2}
                                strokeDasharray="5 5"
                            />
                            <Area
                                type="monotone"
                                dataKey="conservative"
                                stroke="#eab308"
                                fillOpacity={1}
                                fill="url(#colorCons)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="optimistic"
                                stroke="hsl(var(--primary))"
                                fillOpacity={1}
                                fill="url(#colorOpt)"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
