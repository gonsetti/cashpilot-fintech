import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type HistoryPoint = {
  id: string;
  cash_available: number | null;
  burn_rate: number | null;
  runway_months: number | null;
  recorded_at: string;
};

type ChartTab = "cash" | "burn" | "runway";

const tabs: { key: ChartTab; label: string; icon: string }[] = [
  { key: "cash", label: "Cash", icon: "account_balance" },
  { key: "burn", label: "Burn Rate", icon: "local_fire_department" },
  { key: "runway", label: "Runway", icon: "flight_takeoff" },
];

const chartConfig: Record<ChartTab, { color: string; cssVar: string; label: string; formatter: (v: number) => string }> = {
  cash: {
    color: "hsl(217, 91%, 60%)",
    cssVar: "--primary",
    label: "Cash disponible",
    formatter: (v) => `$${v.toLocaleString()}`,
  },
  burn: {
    color: "hsl(0, 84%, 60%)",
    cssVar: "--fintech-red",
    label: "Burn rate mensual",
    formatter: (v) => `$${v.toLocaleString()}`,
  },
  runway: {
    color: "hsl(142, 71%, 45%)",
    cssVar: "--fintech-green",
    label: "Runway (meses)",
    formatter: (v) => `${v.toFixed(1)}m`,
  },
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[0.65rem] text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">{entry.name}: {entry.payload._formatted}</p>
    </div>
  );
}

export default function TrendCharts({ userId }: { userId: string }) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ChartTab>("cash");

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("runway_history")
        .select("id, cash_available, burn_rate, runway_months, recorded_at")
        .eq("user_id", userId)
        .order("recorded_at", { ascending: true })
        .limit(100);
      if (data) setHistory(data as HistoryPoint[]);
      setLoading(false);
    }
    fetch();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 mb-8 animate-pulse">
        <div className="h-5 bg-muted rounded w-56 mb-4" />
        <div className="h-[220px] bg-muted/30 rounded-lg" />
      </div>
    );
  }

  if (history.length < 2) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-icons text-primary text-lg">show_chart</span>
          <h3 className="text-sm font-semibold text-foreground">Tendencias históricas</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Se necesitan al menos 2 registros históricos para mostrar gráficos de tendencia. Los datos se registran automáticamente cada semana.
        </p>
      </div>
    );
  }

  const config = chartConfig[activeTab];

  const chartData = history.map((h) => {
    const val =
      activeTab === "cash"
        ? h.cash_available ?? 0
        : activeTab === "burn"
        ? h.burn_rate ?? 0
        : h.runway_months ?? 0;
    return {
      date: new Date(h.recorded_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
      [config.label]: val,
      _formatted: config.formatter(val),
    };
  });

  // Compute summary stats
  const values = history.map((h) =>
    activeTab === "cash" ? h.cash_available ?? 0 : activeTab === "burn" ? h.burn_rate ?? 0 : h.runway_months ?? 0
  );
  const latest = values[values.length - 1];
  const oldest = values[0];
  const change = latest - oldest;
  const changePercent = oldest !== 0 ? ((change / oldest) * 100).toFixed(1) : "—";
  const isPositive = activeTab === "burn" ? change <= 0 : change >= 0;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="material-icons text-primary text-lg">show_chart</span>
          <h3 className="text-sm font-semibold text-foreground">Tendencias históricas</h3>
          <span className="text-[0.65rem] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {history.length} registros
          </span>
        </div>

        {/* Summary badge */}
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-medium flex items-center gap-0.5 ${isPositive ? "text-fintech-green" : "text-fintech-red"}`}>
            <span className="material-icons" style={{ fontSize: "14px" }}>
              {isPositive ? "trending_up" : "trending_down"}
            </span>
            {changePercent}%
          </span>
          <span className="text-[0.6rem] text-muted-foreground">total</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="material-icons" style={{ fontSize: "14px" }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="px-4 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 19%, 16%)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "hsl(218, 11%, 65%)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(218, 11%, 65%)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => activeTab === "runway" ? `${v}m` : `$${(v / 1000).toFixed(0)}k`}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={config.label}
              stroke={config.color}
              strokeWidth={2}
              fill={`url(#gradient-${activeTab})`}
              dot={{ r: 3, fill: config.color, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: config.color, strokeWidth: 2, stroke: "hsl(216, 22%, 11%)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-3 border-t border-border">
        <div className="px-4 py-3 text-center border-r border-border">
          <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-0.5">Primer registro</div>
          <div className="text-xs font-semibold text-foreground">{config.formatter(oldest)}</div>
        </div>
        <div className="px-4 py-3 text-center border-r border-border">
          <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-0.5">Actual</div>
          <div className="text-xs font-semibold text-foreground">{config.formatter(latest)}</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-0.5">Cambio</div>
          <div className={`text-xs font-semibold ${isPositive ? "text-fintech-green" : "text-fintech-red"}`}>
            {change >= 0 ? "+" : ""}{config.formatter(Math.abs(change))}
          </div>
        </div>
      </div>
    </div>
  );
}
