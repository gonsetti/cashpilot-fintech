
-- Remove overly permissive policy (service_role bypasses RLS anyway)
DROP POLICY "Service role can manage subscriptions" ON public.subscriptions;

-- Add update policy for users
CREATE POLICY "Users can update own subscription"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);
