import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getHealthStatus(runway: number): string {
  if (runway > 9) return "green";
  if (runway >= 6) return "yellow";
  return "red";
}

function getMicroVictory(
  runwayChange: number,
  burnChange: number
): string | null {
  if (runwayChange > 0)
    return `🎉 ¡Tu runway creció ${runwayChange.toFixed(1)} meses esta semana!`;
  if (burnChange < 0)
    return `🔥 Redujiste tu burn rate un ${Math.abs(burnChange).toFixed(0)}% — ¡buen control de gastos!`;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all users with financial data
    const { data: allFinancial, error: fetchErr } = await supabase
      .from("financial_data")
      .select("user_id, cash_available, monthly_revenue, monthly_expenses, burn_rate, runway_months");

    if (fetchErr) throw fetchErr;
    if (!allFinancial || allFinancial.length === 0) {
      return new Response(JSON.stringify({ message: "No users with financial data" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let created = 0;

    for (const fd of allFinancial) {
      const burnRate = fd.burn_rate ?? 0;
      const cash = fd.cash_available ?? 0;
      const runway = burnRate > 0 ? cash / burnRate : null;

      // Get previous summary for comparison
      const { data: prev } = await supabase
        .from("weekly_summaries")
        .select("cash_available, burn_rate, runway_months")
        .eq("user_id", fd.user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const cashChange = prev ? cash - (prev.cash_available ?? 0) : 0;
      const burnRateChange = prev && prev.burn_rate ? ((burnRate - prev.burn_rate) / prev.burn_rate) * 100 : 0;
      const runwayChange = prev?.runway_months && runway ? runway - prev.runway_months : 0;

      const healthStatus = runway != null ? getHealthStatus(runway) : "green";
      const microVictory = getMicroVictory(runwayChange, burnRateChange);

      const { error: insertErr } = await supabase.from("weekly_summaries").insert({
        user_id: fd.user_id,
        cash_available: cash,
        burn_rate: burnRate,
        runway_months: runway,
        cash_change: cashChange,
        burn_rate_change: burnRateChange,
        runway_change: runwayChange,
        health_status: healthStatus,
        micro_victory: microVictory,
      });

      if (insertErr) {
        console.error(`Error inserting summary for ${fd.user_id}:`, insertErr);
      } else {
        created++;
      }
    }

    return new Response(JSON.stringify({ success: true, summaries_created: created }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Weekly summary error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
