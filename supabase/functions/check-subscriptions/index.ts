import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date().toISOString();

    // 1. Mark active subscriptions past their period end as expired
    const { data: expired, error: expError } = await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("current_period_end", now)
      .select("user_id");

    if (expError) {
      console.error("Error expiring subscriptions:", expError);
    } else {
      console.log(`Expired ${expired?.length ?? 0} subscriptions`);
    }

    // 2. Mark trialing subscriptions past their trial end as expired
    const { data: trialExpired, error: trialError } = await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("status", "trialing")
      .lt("trial_end", now)
      .select("user_id");

    if (trialError) {
      console.error("Error expiring trials:", trialError);
    } else {
      console.log(`Expired ${trialExpired?.length ?? 0} trials`);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        expired_subscriptions: expired?.length ?? 0,
        expired_trials: trialExpired?.length ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Check subscriptions error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
