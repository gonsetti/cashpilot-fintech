
-- Table for weekly runway summaries
CREATE TABLE public.weekly_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cash_available NUMERIC,
  burn_rate NUMERIC,
  runway_months NUMERIC,
  cash_change NUMERIC,
  burn_rate_change NUMERIC,
  runway_change NUMERIC,
  health_status TEXT NOT NULL DEFAULT 'green',
  micro_victory TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own summaries"
ON public.weekly_summaries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own summaries"
ON public.weekly_summaries FOR UPDATE
USING (auth.uid() = user_id);

-- Service role insert (edge function uses service role)
CREATE POLICY "Service role can insert summaries"
ON public.weekly_summaries FOR INSERT
WITH CHECK (true);
