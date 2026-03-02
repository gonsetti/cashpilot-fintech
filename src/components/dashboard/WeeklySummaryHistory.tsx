import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type WeeklySummary = {
  id: string;
  cash_available: number | null;
  burn_rate: number | null;
  runway_months: number | null;
  cash_change: number | null;
  burn_rate_change: number | null;
  runway_change: number | null;
  health_status: string;
  micro_victory: string | null;
  is_read: boolean;
  created_at: string;
};

function TrendBadge({ value, suffix = "" }: { value: number | null; suffix?: string }) {
  if (value == null || value === 0) return <span className="text-muted-foreground">—</span>;
  const positive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? "text-fintech-green" : "text-fintech-red"}`}>
      <span className="material-icons" style={{ fontSize: "12px" }}>{positive ? "arrow_upward" : "arrow_downward"}</span>
      {Math.abs(value).toLocaleString()}{suffix}
    </span>
  );
}

function HealthBadge({ status }: { status: string }) {
  const config = {
    green: { emoji: "🟢", label: "Saludable", classes: "text-fintech-green bg-fintech-green/10 border-fintech-green/20" },
    yellow: { emoji: "🟡", label: "Atención", classes: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    red: { emoji: "🔴", label: "Riesgo", classes: "text-fintech-red bg-fintech-red/10 border-fintech-red/20" },
  }[status] ?? { emoji: "⚪", label: status, classes: "text-muted-foreground bg-muted/10 border-border" };

  return (
    <span className={`text-[0.65rem] font-medium px-2 py-0.5 rounded-full border ${config.classes}`}>
      {config.emoji} {config.label}
    </span>
  );
}

export default function WeeklySummaryHistory({ userId }: { userId: string }) {
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("weekly_summaries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(52);
      if (data) setSummaries(data as WeeklySummary[]);
      setLoading(false);
    }
    fetch();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
        <div className="h-5 bg-muted rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/50 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-icons text-muted-foreground text-lg">history</span>
          <h3 className="text-sm font-semibold text-foreground">Historial de resúmenes</h3>
        </div>
        <p className="text-xs text-muted-foreground">Aún no hay resúmenes semanales. El primero se generará el próximo lunes.</p>
      </div>
    );
  }

  const visible = expanded ? summaries : summaries.slice(0, 5);
  const selected = selectedId ? summaries.find(s => s.id === selectedId) : null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="material-icons text-primary text-lg">history</span>
          <h3 className="text-sm font-semibold text-foreground">Historial de resúmenes</h3>
          <span className="text-[0.65rem] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{summaries.length}</span>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="border-b border-border bg-secondary/30 p-4 animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HealthBadge status={selected.health_status} />
              <span className="text-xs text-muted-foreground">
                {new Date(selected.created_at).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="material-icons text-sm">close</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-card rounded-lg p-3 border border-border">
              <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-1">Cash</div>
              <div className="text-sm font-bold text-foreground">${(selected.cash_available ?? 0).toLocaleString()}</div>
              <TrendBadge value={selected.cash_change} suffix="" />
            </div>
            <div className="bg-card rounded-lg p-3 border border-border">
              <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-1">Burn rate</div>
              <div className="text-sm font-bold text-foreground">${(selected.burn_rate ?? 0).toLocaleString()}</div>
              <TrendBadge value={selected.burn_rate_change ? -selected.burn_rate_change : null} suffix="%" />
            </div>
            <div className="bg-card rounded-lg p-3 border border-border">
              <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-1">Runway</div>
              <div className="text-sm font-bold text-foreground">{selected.runway_months != null ? `${selected.runway_months.toFixed(1)}m` : "∞"}</div>
              <TrendBadge value={selected.runway_change} suffix=" meses" />
            </div>
          </div>

          {selected.micro_victory && (
            <div className="px-3 py-2 bg-fintech-green/5 border border-fintech-green/10 rounded-lg">
              <p className="text-xs text-fintech-green">{selected.micro_victory}</p>
            </div>
          )}
        </div>
      )}

      {/* List */}
      <div className="divide-y divide-border">
        {visible.map((s) => {
          const date = new Date(s.created_at);
          const isSelected = s.id === selectedId;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedId(isSelected ? null : s.id)}
              className={`w-full flex items-center justify-between px-5 py-3 text-left hover:bg-secondary/50 transition-colors ${isSelected ? "bg-secondary/50" : ""}`}
            >
              <div className="flex items-center gap-3">
                <HealthBadge status={s.health_status} />
                <div>
                  <span className="text-sm text-foreground font-medium capitalize">
                    {date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div className="hidden sm:block">
                  <span className="text-xs text-muted-foreground">Cash </span>
                  <span className="text-xs text-foreground font-medium">${(s.cash_available ?? 0).toLocaleString()}</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xs text-muted-foreground">Runway </span>
                  <span className="text-xs text-foreground font-medium">{s.runway_months != null ? `${s.runway_months.toFixed(1)}m` : "∞"}</span>
                </div>
                <span className="material-icons text-muted-foreground text-sm">{isSelected ? "expand_less" : "expand_more"}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Show more */}
      {summaries.length > 5 && (
        <div className="border-t border-border px-5 py-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
          >
            <span className="material-icons text-sm">{expanded ? "expand_less" : "expand_more"}</span>
            {expanded ? "Mostrar menos" : `Ver todos (${summaries.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
