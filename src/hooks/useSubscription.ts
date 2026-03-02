import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionStatus = "trialing" | "active" | "expired" | "payment_failed" | "loading";

export interface SubscriptionData {
  status: SubscriptionStatus;
  trialEnd: Date | null;
  daysLeft: number;
  hasAccess: boolean;
}

export function useSubscription(userId: string | undefined) {
  const [data, setData] = useState<SubscriptionData>({
    status: "loading",
    trialEnd: null,
    daysLeft: 0,
    hasAccess: false,
  });

  useEffect(() => {
    if (!userId) return;

    const fetch = async () => {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!sub) {
        // No subscription record yet - create one (shouldn't happen with trigger)
        setData({ status: "trialing", trialEnd: null, daysLeft: 14, hasAccess: true });
        return;
      }

      const now = new Date();
      const trialEnd = new Date(sub.trial_end);
      const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      if (sub.status === "active") {
        const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;
        const activeAccess = !periodEnd || periodEnd > now;
        if (!activeAccess) {
          // Period ended — treat as expired so the gate blocks access
          setData({ status: "expired", trialEnd, daysLeft: 0, hasAccess: false });
        } else {
          setData({ status: "active", trialEnd, daysLeft: 0, hasAccess: true });
        }
      } else if (sub.status === "trialing" && trialEnd > now) {
        setData({ status: "trialing", trialEnd, daysLeft, hasAccess: true });
      } else {
        setData({ status: "expired", trialEnd, daysLeft: 0, hasAccess: false });
      }
    };

    fetch();
  }, [userId]);

  return data;
}
