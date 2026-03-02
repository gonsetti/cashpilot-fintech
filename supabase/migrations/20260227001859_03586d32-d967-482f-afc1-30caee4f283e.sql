-- Ensure the trigger for auto-creating profiles exists
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure updated_at trigger exists for financial_data
CREATE OR REPLACE TRIGGER update_financial_data_updated_at
  BEFORE UPDATE ON public.financial_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();