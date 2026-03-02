ALTER TABLE public.subscriptions ADD COLUMN mp_subscription_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE;