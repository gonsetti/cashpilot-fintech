
-- Financial data table
CREATE TABLE public.financial_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cash_available NUMERIC NOT NULL DEFAULT 0,
  monthly_revenue NUMERIC NOT NULL DEFAULT 0,
  monthly_expenses NUMERIC NOT NULL DEFAULT 0,
  burn_rate NUMERIC GENERATED ALWAYS AS (GREATEST(monthly_expenses - monthly_revenue, 0)) STORED,
  runway_months NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN (monthly_expenses - monthly_revenue) > 0 
      THEN cash_available / (monthly_expenses - monthly_revenue)
      ELSE NULL
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.financial_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own financial data"
  ON public.financial_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial data"
  ON public.financial_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial data"
  ON public.financial_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial data"
  ON public.financial_data FOR DELETE
  USING (auth.uid() = user_id);

-- Runway history table (weekly snapshots)
CREATE TABLE public.runway_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  runway_months NUMERIC,
  cash_available NUMERIC,
  burn_rate NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.runway_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own runway history"
  ON public.runway_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own runway history"
  ON public.runway_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User activity tracking
CREATE TABLE public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON public.user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on financial_data
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_financial_data_updated_at
  BEFORE UPDATE ON public.financial_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
