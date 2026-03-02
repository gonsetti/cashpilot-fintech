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
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    const MP_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "Not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Handle payment notifications
    if (body.type === "payment") {
      const paymentId = body.data?.id;
      if (!paymentId) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      });
      const payment = await mpResponse.json();
      console.log("Payment details:", JSON.stringify(payment));

      const userId = payment.external_reference;
      if (!userId) {
        console.error("No user ID in external_reference");
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (payment.status === "approved") {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            mp_payment_id: String(paymentId),
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
          })
          .eq("user_id", userId);

        console.log(`Subscription activated for user ${userId}`);
      } else if (payment.status === "rejected" || payment.status === "cancelled") {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", userId)
          .single();

        if (sub && sub.status !== "active") {
          await supabase
            .from("subscriptions")
            .update({ status: "payment_failed" })
            .eq("user_id", userId);
        }
      }
    }

    // Handle subscription (preapproval) notifications
    if (body.type === "subscription_preapproval") {
      const preapprovalId = body.data?.id;
      if (!preapprovalId) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      });
      const preapproval = await mpResponse.json();
      console.log("Preapproval details:", JSON.stringify(preapproval));

      const userId = preapproval.external_reference;
      if (!userId) {
        console.error("No user ID in external_reference");
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (preapproval.status === "authorized") {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            mp_subscription_id: preapprovalId,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
          })
          .eq("user_id", userId);

        console.log(`Subscription authorized for user ${userId}`);
      } else if (preapproval.status === "paused") {
        await supabase
          .from("subscriptions")
          .update({ status: "paused" })
          .eq("user_id", userId);
      } else if (preapproval.status === "cancelled") {
        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        console.log(`Subscription cancelled for user ${userId}`);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
