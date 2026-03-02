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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email;

    const MP_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "MercadoPago not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://sovereign-atlas.lovable.app";

    // Try MercadoPago Preapproval (recurring) first, fallback to Checkout Preference
    const preapproval = {
      reason: "Sovereign Atlas - Plan Fundadores",
      external_reference: userId,
      payer_email: userEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 29,
        currency_id: "UYU",
      },
      back_url: `${origin}/subscription?status=success`,
      status: "pending",
    };

    let mpData: any;
    let isRecurring = true;

    // Attempt preapproval (recurring subscription)
    const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preapproval),
    });

    mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.warn("Preapproval failed, falling back to checkout preference:", JSON.stringify(mpData));
      isRecurring = false;

      // Fallback: one-time checkout preference
      const preference = {
        items: [
          {
            title: "Sovereign Atlas - Plan Fundadores (1 mes)",
            quantity: 1,
            unit_price: 29,
            currency_id: "UYU",
          },
        ],
        payer: { email: userEmail },
        back_urls: {
          success: `${origin}/subscription?status=success`,
          failure: `${origin}/subscription?status=failure`,
          pending: `${origin}/subscription?status=pending`,
        },
        auto_return: "approved",
        external_reference: userId,
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mp-webhook`,
      };

      const fallbackRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preference),
      });

      mpData = await fallbackRes.json();

      if (!fallbackRes.ok) {
        console.error("Checkout preference also failed:", JSON.stringify(mpData));
        return new Response(JSON.stringify({ error: "Failed to create payment", details: mpData }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Save reference
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const updateData: Record<string, string> = { mp_preference_id: mpData.id };
    if (isRecurring) updateData.mp_subscription_id = mpData.id;

    await adminClient
      .from("subscriptions")
      .update(updateData)
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        subscription_id: mpData.id,
        recurring: isRecurring,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
