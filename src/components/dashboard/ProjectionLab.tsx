import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

type Props = {
  cashAvailable: number;
  burnRate: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
};

function generateProjection({ cashAvailable, burnRate, monthlyRevenue, monthlyExpenses }: Props) {
  const months = 12;
  const data = [];
  let cash = cashAvailable;
  const netBurn = monthlyExpenses - monthlyRevenue; // positive = burning

  for (let i = 0; i <= months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const label = date.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
    
    const riskLevel = cash <= 0 ? "critical" : netBurn > 0 && cash / netBurn < 3 ? "warning" : "safe";

    data.push({
      month: label,
      cash: Math.max(cash, 0),
      rawCash: cash,
      risk: riskLevel,
      monthIndex: i,
    });

    cash -= netBurn;
  }

  return data;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;
  
  const riskLabels = { safe: "Seguro", warning: "Precaución", critical: "Crítico" };
  const riskColors = { safe: "text-fintech-green", warning: "text-yellow-400", critical: "text-fintech-red" };

  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-xl">
      <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-base font-bold text-foreground mb-1">
        ${entry.cash.toLocaleString()}
      </p>
      <p className={`text-xs font-semibold ${riskColors[entry.risk as keyof typeof riskColors]}`}>
        {riskLabels[entry.risk as keyof typeof riskLabels]}
      </p>
    </div>
  );
}

export default function ProjectionLab(props: Props) {
  const data = generateProjection(props);
  const netBurn = props.monthlyExpenses - props.monthlyRevenue;
  const isSustainable = netBurn <= 0;

  // Find where cash hits critical zone
  const criticalIndex = data.findIndex(d => d.risk === "critical");
  const warningIndex = data.findIndex(d => d.risk === "warning");

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-icons text-primary text-base">ssid_chart</span>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Cash Projection</h3>
          <span className="text-[0.6rem] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">12 meses</span>
        </div>
        {isSustainable && (
          <span className="text-xs text-fintech-green font-medium flex items-center gap-1">
            <span className="material-icons text-sm">check_circle</span>
            Sostenible
          </span>
        )}
      </div>

      <div className="px-4 pt-6 pb-2">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 19%, 16%)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "hsl(218, 11%, 65%)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(218, 11%, 65%)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Red zone when cash < 3 months burn */}
            {criticalIndex >= 0 && (
              <ReferenceArea
                x1={data[Math.max(criticalIndex - 1, 0)].month}
                x2={data[data.length - 1].month}
                fill="hsl(0, 84%, 60%)"
                fillOpacity={0.05}
              />
            )}

            <Area
              type="monotone"
              dataKey="cash"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2.5}
              fill="url(#projectionGradient)"
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                const color = payload.risk === "critical" ? "hsl(0, 84%, 60%)" : payload.risk === "warning" ? "hsl(45, 93%, 47%)" : "hsl(217, 91%, 60%)";
                return <circle key={payload.monthIndex} cx={cx} cy={cy} r={4} fill={color} stroke="hsl(216, 22%, 11%)" strokeWidth={2} />;
              }}
              activeDot={{ r: 6, fill: "hsl(217, 91%, 60%)", stroke: "hsl(216, 22%, 11%)", strokeWidth: 2 }}
            />

            {/* Zero line */}
            <ReferenceLine y={0} stroke="hsl(0, 84%, 60%)" strokeDasharray="4 4" strokeOpacity={0.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom info */}
      <div className="grid grid-cols-3 border-t border-border">
        <div className="px-4 py-3 text-center border-r border-border">
          <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-0.5">Hoy</div>
          <div className="text-sm font-bold text-foreground">${props.cashAvailable.toLocaleString()}</div>
        </div>
        <div className="px-4 py-3 text-center border-r border-border">
          <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-0.5">En 6 meses</div>
          <div className="text-sm font-bold text-foreground">${Math.max(data[6]?.cash ?? 0, 0).toLocaleString()}</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-0.5">En 12 meses</div>
          <div className={`text-sm font-bold ${(data[12]?.rawCash ?? 0) <= 0 ? "text-fintech-red" : "text-foreground"}`}>
            {(data[12]?.rawCash ?? 0) <= 0 ? "$0" : `$${Math.max(data[12]?.cash ?? 0, 0).toLocaleString()}`}
          </div>
        </div>
      </div>
    </div>
  );
}
